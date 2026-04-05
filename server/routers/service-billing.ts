import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";

// Helper to generate invoice numbers
function generateInvoiceNumber(serviceType: 'design' | 'media'): string {
  const prefix = serviceType === 'design' ? 'DES' : 'MED';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Helper to calculate member price
function calculateMemberPrice(basePrice: number, discountPercent: number = 20): number {
  return basePrice * (1 - discountPercent / 100);
}

export const serviceBillingRouter = router({
  // ============================================================================
  // SERVICE PACKAGES
  // ============================================================================

  getDesignPackages: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    try {
      const [packages] = await db.execute(
        `SELECT * FROM service_packages 
         WHERE service_type = 'design' AND is_active = TRUE 
         ORDER BY display_order ASC`
      );
      return (packages as any[]).map(pkg => ({
        ...pkg,
        deliverables: pkg.deliverables ? JSON.parse(pkg.deliverables) : [],
        features: pkg.features ? JSON.parse(pkg.features) : [],
      }));
    } catch (error) {
      console.error("Error fetching design packages:", error);
      return [];
    }
  }),

  getMediaPackages: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    try {
      const [packages] = await db.execute(
        `SELECT * FROM service_packages 
         WHERE service_type = 'media' AND is_active = TRUE 
         ORDER BY display_order ASC`
      );
      return (packages as any[]).map(pkg => ({
        ...pkg,
        deliverables: pkg.deliverables ? JSON.parse(pkg.deliverables) : [],
        features: pkg.features ? JSON.parse(pkg.features) : [],
      }));
    } catch (error) {
      console.error("Error fetching media packages:", error);
      return [];
    }
  }),

  getPackageById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const [packages] = await db.execute(
          `SELECT * FROM service_packages WHERE id = ?`,
          [input.id]
        );
        const pkg = (packages as any[])[0];
        if (!pkg) return null;
        return {
          ...pkg,
          deliverables: pkg.deliverables ? JSON.parse(pkg.deliverables) : [],
          features: pkg.features ? JSON.parse(pkg.features) : [],
        };
      } catch (error) {
        console.error("Error fetching package:", error);
        return null;
      }
    }),

  // Admin: Create/Update packages
  createPackage: protectedProcedure
    .input(z.object({
      serviceType: z.enum(['design', 'media']),
      packageName: z.string().min(1),
      packageCode: z.string().min(1),
      description: z.string().optional(),
      category: z.string().optional(),
      basePrice: z.number().min(0),
      memberDiscountPercent: z.number().min(0).max(100).default(20),
      pricingType: z.enum(['fixed', 'hourly', 'per_item', 'subscription']).default('fixed'),
      estimatedHours: z.number().optional(),
      deliverables: z.array(z.string()).optional(),
      features: z.array(z.string()).optional(),
      displayOrder: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const now = Date.now();
        const memberPrice = calculateMemberPrice(input.basePrice, input.memberDiscountPercent);

        const [result] = await db.execute(
          `INSERT INTO service_packages 
           (service_type, package_name, package_code, description, category, 
            base_price, member_price, member_discount_percent, pricing_type, 
            estimated_hours, deliverables, features, display_order, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            input.serviceType,
            input.packageName,
            input.packageCode,
            input.description || null,
            input.category || null,
            input.basePrice,
            memberPrice,
            input.memberDiscountPercent,
            input.pricingType,
            input.estimatedHours || null,
            input.deliverables ? JSON.stringify(input.deliverables) : null,
            input.features ? JSON.stringify(input.features) : null,
            input.displayOrder,
            now,
            now,
          ]
        );

        return { success: true, id: (result as any).insertId };
      } catch (error) {
        console.error("Error creating package:", error);
        throw new Error("Failed to create service package");
      }
    }),

  updatePackage: protectedProcedure
    .input(z.object({
      id: z.number(),
      packageName: z.string().min(1).optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      basePrice: z.number().min(0).optional(),
      memberDiscountPercent: z.number().min(0).max(100).optional(),
      pricingType: z.enum(['fixed', 'hourly', 'per_item', 'subscription']).optional(),
      estimatedHours: z.number().optional(),
      deliverables: z.array(z.string()).optional(),
      features: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
      displayOrder: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const updates: string[] = [];
        const values: any[] = [];

        if (input.packageName !== undefined) {
          updates.push('package_name = ?');
          values.push(input.packageName);
        }
        if (input.description !== undefined) {
          updates.push('description = ?');
          values.push(input.description);
        }
        if (input.category !== undefined) {
          updates.push('category = ?');
          values.push(input.category);
        }
        if (input.basePrice !== undefined) {
          updates.push('base_price = ?');
          values.push(input.basePrice);
          // Also update member price
          const discountPercent = input.memberDiscountPercent ?? 20;
          updates.push('member_price = ?');
          values.push(calculateMemberPrice(input.basePrice, discountPercent));
        }
        if (input.memberDiscountPercent !== undefined) {
          updates.push('member_discount_percent = ?');
          values.push(input.memberDiscountPercent);
        }
        if (input.pricingType !== undefined) {
          updates.push('pricing_type = ?');
          values.push(input.pricingType);
        }
        if (input.estimatedHours !== undefined) {
          updates.push('estimated_hours = ?');
          values.push(input.estimatedHours);
        }
        if (input.deliverables !== undefined) {
          updates.push('deliverables = ?');
          values.push(JSON.stringify(input.deliverables));
        }
        if (input.features !== undefined) {
          updates.push('features = ?');
          values.push(JSON.stringify(input.features));
        }
        if (input.isActive !== undefined) {
          updates.push('is_active = ?');
          values.push(input.isActive);
        }
        if (input.displayOrder !== undefined) {
          updates.push('display_order = ?');
          values.push(input.displayOrder);
        }

        updates.push('updated_at = ?');
        values.push(Date.now());
        values.push(input.id);

        await db.execute(
          `UPDATE service_packages SET ${updates.join(', ')} WHERE id = ?`,
          values
        );

        return { success: true };
      } catch (error) {
        console.error("Error updating package:", error);
        throw new Error("Failed to update service package");
      }
    }),

  // ============================================================================
  // INVOICES
  // ============================================================================

  createInvoice: protectedProcedure
    .input(z.object({
      serviceType: z.enum(['design', 'media']),
      packageId: z.number().optional(),
      customServiceName: z.string().optional(),
      clientType: z.enum(['internal_house', 'internal_business', 'external']),
      clientId: z.number().optional(),
      clientName: z.string().min(1),
      clientEmail: z.string().email().optional(),
      isLawsMember: z.boolean().default(false),
      lineItems: z.array(z.object({
        description: z.string(),
        quantity: z.number().min(1),
        unitPrice: z.number().min(0),
        total: z.number(),
      })),
      discountAmount: z.number().default(0),
      discountReason: z.string().optional(),
      taxRate: z.number().default(0),
      dueDate: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const now = Date.now();
        const invoiceNumber = generateInvoiceNumber(input.serviceType);

        // Calculate totals
        const subtotal = input.lineItems.reduce((sum, item) => sum + item.total, 0);
        const taxAmount = (subtotal - input.discountAmount) * (input.taxRate / 100);
        const totalAmount = subtotal - input.discountAmount + taxAmount;

        const [result] = await db.execute(
          `INSERT INTO service_invoices 
           (invoice_number, service_type, package_id, custom_service_name, 
            client_type, client_id, client_name, client_email, is_laws_member,
            subtotal, discount_amount, discount_reason, tax_amount, total_amount,
            status, due_date, line_items, notes, created_by_id, created_by_name, 
            created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?)`,
          [
            invoiceNumber,
            input.serviceType,
            input.packageId || null,
            input.customServiceName || null,
            input.clientType,
            input.clientId || null,
            input.clientName,
            input.clientEmail || null,
            input.isLawsMember,
            subtotal,
            input.discountAmount,
            input.discountReason || null,
            taxAmount,
            totalAmount,
            input.dueDate || null,
            JSON.stringify(input.lineItems),
            input.notes || null,
            ctx.user.id,
            ctx.user.name,
            now,
            now,
          ]
        );

        return {
          success: true,
          id: (result as any).insertId,
          invoiceNumber,
          totalAmount,
        };
      } catch (error) {
        console.error("Error creating invoice:", error);
        throw new Error("Failed to create invoice");
      }
    }),

  // Quick invoice from package
  createInvoiceFromPackage: protectedProcedure
    .input(z.object({
      packageId: z.number(),
      clientType: z.enum(['internal_house', 'internal_business', 'external']),
      clientId: z.number().optional(),
      clientName: z.string().min(1),
      clientEmail: z.string().email().optional(),
      isLawsMember: z.boolean().default(false),
      quantity: z.number().default(1),
      customNotes: z.string().optional(),
      dueDate: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Get package details
        const [packages] = await db.execute(
          `SELECT * FROM service_packages WHERE id = ?`,
          [input.packageId]
        );
        const pkg = (packages as any[])[0];
        if (!pkg) throw new Error("Package not found");

        const now = Date.now();
        const invoiceNumber = generateInvoiceNumber(pkg.service_type);

        // Calculate price based on membership
        const unitPrice = input.isLawsMember ? Number(pkg.member_price) : Number(pkg.base_price);
        const subtotal = unitPrice * input.quantity;
        const discountAmount = input.isLawsMember ? (Number(pkg.base_price) - Number(pkg.member_price)) * input.quantity : 0;
        const totalAmount = subtotal;

        const lineItems = [{
          description: pkg.package_name,
          quantity: input.quantity,
          unitPrice: unitPrice,
          total: subtotal,
        }];

        const [result] = await db.execute(
          `INSERT INTO service_invoices 
           (invoice_number, service_type, package_id, client_type, client_id, 
            client_name, client_email, is_laws_member, subtotal, discount_amount, 
            discount_reason, tax_amount, total_amount, status, due_date, line_items, 
            notes, created_by_id, created_by_name, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'draft', ?, ?, ?, ?, ?, ?, ?)`,
          [
            invoiceNumber,
            pkg.service_type,
            input.packageId,
            input.clientType,
            input.clientId || null,
            input.clientName,
            input.clientEmail || null,
            input.isLawsMember,
            subtotal,
            discountAmount,
            input.isLawsMember ? 'L.A.W.S. Member Discount (20%)' : null,
            totalAmount,
            input.dueDate || (now + 30 * 24 * 60 * 60 * 1000), // Default 30 days
            JSON.stringify(lineItems),
            input.customNotes || null,
            ctx.user.id,
            ctx.user.name,
            now,
            now,
          ]
        );

        return {
          success: true,
          id: (result as any).insertId,
          invoiceNumber,
          totalAmount,
          memberSavings: discountAmount,
        };
      } catch (error) {
        console.error("Error creating invoice from package:", error);
        throw new Error("Failed to create invoice");
      }
    }),

  getInvoices: protectedProcedure
    .input(z.object({
      serviceType: z.enum(['design', 'media']).optional(),
      status: z.enum(['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled', 'refunded']).optional(),
      clientType: z.enum(['internal_house', 'internal_business', 'external']).optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        let query = `SELECT * FROM service_invoices WHERE 1=1`;
        const params: any[] = [];

        if (input.serviceType) {
          query += ` AND service_type = ?`;
          params.push(input.serviceType);
        }
        if (input.status) {
          query += ` AND status = ?`;
          params.push(input.status);
        }
        if (input.clientType) {
          query += ` AND client_type = ?`;
          params.push(input.clientType);
        }

        query += ` ORDER BY created_at DESC LIMIT ?`;
        params.push(input.limit);

        const [invoices] = await db.execute(query, params);
        return (invoices as any[]).map(inv => ({
          ...inv,
          line_items: inv.line_items ? JSON.parse(inv.line_items) : [],
        }));
      } catch (error) {
        console.error("Error fetching invoices:", error);
        return [];
      }
    }),

  getInvoiceById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const [invoices] = await db.execute(
          `SELECT i.*, p.package_name, p.description as package_description
           FROM service_invoices i
           LEFT JOIN service_packages p ON i.package_id = p.id
           WHERE i.id = ?`,
          [input.id]
        );
        const invoice = (invoices as any[])[0];
        if (!invoice) return null;
        return {
          ...invoice,
          line_items: invoice.line_items ? JSON.parse(invoice.line_items) : [],
        };
      } catch (error) {
        console.error("Error fetching invoice:", error);
        return null;
      }
    }),

  sendInvoice: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db.execute(
          `UPDATE service_invoices SET status = 'sent', updated_at = ? WHERE id = ? AND status = 'draft'`,
          [Date.now(), input.id]
        );
        return { success: true };
      } catch (error) {
        console.error("Error sending invoice:", error);
        throw new Error("Failed to send invoice");
      }
    }),

  cancelInvoice: protectedProcedure
    .input(z.object({ id: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db.execute(
          `UPDATE service_invoices 
           SET status = 'cancelled', notes = CONCAT(IFNULL(notes, ''), '\nCancelled: ', ?), updated_at = ? 
           WHERE id = ?`,
          [input.reason || 'No reason provided', Date.now(), input.id]
        );
        return { success: true };
      } catch (error) {
        console.error("Error cancelling invoice:", error);
        throw new Error("Failed to cancel invoice");
      }
    }),

  // ============================================================================
  // BILLING STATS
  // ============================================================================

  getBillingStats: protectedProcedure
    .input(z.object({
      serviceType: z.enum(['design', 'media']).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        let typeFilter = '';
        const params: any[] = [];
        if (input.serviceType) {
          typeFilter = ' AND service_type = ?';
          params.push(input.serviceType);
        }

        // Total revenue (paid invoices)
        const [revenueResult] = await db.execute(
          `SELECT SUM(total_amount) as total FROM service_invoices WHERE status = 'paid'${typeFilter}`,
          params
        );
        const totalRevenue = Number((revenueResult as any[])[0]?.total) || 0;

        // Pending invoices
        const [pendingResult] = await db.execute(
          `SELECT COUNT(*) as count, SUM(total_amount) as total 
           FROM service_invoices WHERE status IN ('draft', 'sent')${typeFilter}`,
          params
        );
        const pendingCount = Number((pendingResult as any[])[0]?.count) || 0;
        const pendingAmount = Number((pendingResult as any[])[0]?.total) || 0;

        // Member vs non-member revenue
        const [memberResult] = await db.execute(
          `SELECT 
             SUM(CASE WHEN is_laws_member = TRUE THEN total_amount ELSE 0 END) as member_revenue,
             SUM(CASE WHEN is_laws_member = FALSE THEN total_amount ELSE 0 END) as external_revenue,
             SUM(discount_amount) as total_member_savings
           FROM service_invoices WHERE status = 'paid'${typeFilter}`,
          params
        );
        const memberRevenue = Number((memberResult as any[])[0]?.member_revenue) || 0;
        const externalRevenue = Number((memberResult as any[])[0]?.external_revenue) || 0;
        const totalMemberSavings = Number((memberResult as any[])[0]?.total_member_savings) || 0;

        // Revenue by client type
        const [clientTypeResult] = await db.execute(
          `SELECT client_type, SUM(total_amount) as total 
           FROM service_invoices WHERE status = 'paid'${typeFilter}
           GROUP BY client_type`,
          params
        );

        // This month's revenue
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const [monthResult] = await db.execute(
          `SELECT SUM(total_amount) as total FROM service_invoices 
           WHERE status = 'paid' AND paid_at >= ?${typeFilter}`,
          [startOfMonth.getTime(), ...params]
        );
        const monthlyRevenue = Number((monthResult as any[])[0]?.total) || 0;

        return {
          totalRevenue,
          monthlyRevenue,
          pendingCount,
          pendingAmount,
          memberRevenue,
          externalRevenue,
          totalMemberSavings,
          revenueByClientType: (clientTypeResult as any[]).reduce((acc, row) => {
            acc[row.client_type] = Number(row.total);
            return acc;
          }, {} as Record<string, number>),
        };
      } catch (error) {
        console.error("Error fetching billing stats:", error);
        return null;
      }
    }),

  // ============================================================================
  // PAYMENT RECORDING (Manual + Stripe webhook integration)
  // ============================================================================

  recordPayment: protectedProcedure
    .input(z.object({
      invoiceId: z.number(),
      paymentAmount: z.number().min(0.01),
      paymentMethod: z.enum(['stripe', 'cash', 'check', 'transfer', 'internal_credit']),
      transactionReference: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const now = Date.now();

        // Get invoice details
        const [invoices] = await db.execute(
          `SELECT * FROM service_invoices WHERE id = ?`,
          [input.invoiceId]
        );
        const invoice = (invoices as any[])[0];
        if (!invoice) throw new Error("Invoice not found");

        // Calculate 60/40 split
        const revenueSplitAmount = input.paymentAmount * 0.60; // 60% to business
        const trustAllocationAmount = input.paymentAmount * 0.40; // 40% to trust

        // Record payment
        const [paymentResult] = await db.execute(
          `INSERT INTO service_payments 
           (invoice_id, payment_amount, payment_method, transaction_reference,
            revenue_split_processed, revenue_split_amount, trust_allocation_amount,
            payment_date, notes, processed_by_id, processed_by_name, created_at)
           VALUES (?, ?, ?, ?, FALSE, ?, ?, ?, ?, ?, ?, ?)`,
          [
            input.invoiceId,
            input.paymentAmount,
            input.paymentMethod,
            input.transactionReference || null,
            revenueSplitAmount,
            trustAllocationAmount,
            now,
            input.notes || null,
            ctx.user.id,
            ctx.user.name,
            now,
          ]
        );

        // Update invoice status
        const totalPaid = Number(invoice.total_amount) <= input.paymentAmount ? 'paid' : 'partial';
        await db.execute(
          `UPDATE service_invoices 
           SET status = ?, paid_at = ?, updated_at = ?
           WHERE id = ?`,
          [totalPaid, now, now, input.invoiceId]
        );

        return {
          success: true,
          paymentId: (paymentResult as any).insertId,
          revenueSplit: {
            businessShare: revenueSplitAmount,
            trustShare: trustAllocationAmount,
          },
        };
      } catch (error) {
        console.error("Error recording payment:", error);
        throw new Error("Failed to record payment");
      }
    }),

  getPaymentsByInvoice: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const [payments] = await db.execute(
          `SELECT * FROM service_payments WHERE invoice_id = ? ORDER BY payment_date DESC`,
          [input.invoiceId]
        );
        return payments as any[];
      } catch (error) {
        console.error("Error fetching payments:", error);
        return [];
      }
    }),

  // ============================================================================
  // STRIPE CHECKOUT FOR SERVICE INVOICES
  // ============================================================================

  createServiceCheckout: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Get invoice details
        const [invoices] = await db.execute(
          `SELECT i.*, p.package_name 
           FROM service_invoices i
           LEFT JOIN service_packages p ON i.package_id = p.id
           WHERE i.id = ?`,
          [input.invoiceId]
        );
        const invoice = (invoices as any[])[0];
        if (!invoice) throw new Error("Invoice not found");

        if (invoice.status === 'paid') {
          throw new Error("Invoice is already paid");
        }

        // Dynamic import Stripe
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
          apiVersion: "2024-12-18.acacia",
        });

        const origin = ctx.req.headers.origin || "http://localhost:3000";
        const serviceName = invoice.package_name || invoice.custom_service_name || 'Service';
        const serviceType = invoice.service_type === 'design' ? 'Design' : 'Media';

        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          customer_email: invoice.client_email || undefined,
          client_reference_id: invoice.id.toString(),
          allow_promotion_codes: true,
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `${serviceType} Service: ${serviceName}`,
                  description: `Invoice #${invoice.invoice_number}`,
                },
                unit_amount: Math.round(Number(invoice.total_amount) * 100), // Convert to cents
              },
              quantity: 1,
            },
          ],
          metadata: {
            invoice_id: invoice.id.toString(),
            invoice_number: invoice.invoice_number,
            service_type: invoice.service_type,
            client_name: invoice.client_name,
            is_laws_member: invoice.is_laws_member ? 'true' : 'false',
            type: "service_invoice",
          },
          success_url: `${origin}/${invoice.service_type}-services?payment=success&invoice=${invoice.invoice_number}`,
          cancel_url: `${origin}/${invoice.service_type}-services?payment=canceled&invoice=${invoice.invoice_number}`,
        });

        // Update invoice with Stripe session info
        await db.execute(
          `UPDATE service_invoices SET stripe_invoice_id = ?, updated_at = ? WHERE id = ?`,
          [session.id, Date.now(), input.invoiceId]
        );

        return { checkoutUrl: session.url };
      } catch (error) {
        console.error("Error creating service checkout:", error);
        throw new Error("Failed to create checkout session");
      }
    }),

  // Process Stripe webhook for service payments (called from webhook handler)
  processStripePayment: protectedProcedure
    .input(z.object({
      invoiceId: z.number(),
      stripePaymentIntentId: z.string(),
      stripeChargeId: z.string().optional(),
      amount: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const now = Date.now();

        // Get invoice details
        const [invoices] = await db.execute(
          `SELECT * FROM service_invoices WHERE id = ?`,
          [input.invoiceId]
        );
        const invoice = (invoices as any[])[0];
        if (!invoice) throw new Error("Invoice not found");

        // Calculate 60/40 split for revenue flow
        const revenueSplitAmount = input.amount * 0.60; // 60% to business operations
        const trustAllocationAmount = input.amount * 0.40; // 40% to trust

        // Record payment
        const [paymentResult] = await db.execute(
          `INSERT INTO service_payments 
           (invoice_id, payment_amount, payment_method, stripe_payment_intent_id, stripe_charge_id,
            revenue_split_processed, revenue_split_amount, trust_allocation_amount,
            payment_date, notes, processed_by_id, processed_by_name, created_at)
           VALUES (?, ?, 'stripe', ?, ?, FALSE, ?, ?, ?, 'Stripe payment processed', ?, ?, ?)`,
          [
            input.invoiceId,
            input.amount,
            input.stripePaymentIntentId,
            input.stripeChargeId || null,
            revenueSplitAmount,
            trustAllocationAmount,
            now,
            ctx.user.id,
            ctx.user.name,
            now,
          ]
        );

        // Update invoice status
        await db.execute(
          `UPDATE service_invoices 
           SET status = 'paid', paid_at = ?, stripe_payment_intent_id = ?, updated_at = ?
           WHERE id = ?`,
          [now, input.stripePaymentIntentId, now, input.invoiceId]
        );

        return {
          success: true,
          paymentId: (paymentResult as any).insertId,
          revenueSplit: {
            businessShare: revenueSplitAmount,
            trustShare: trustAllocationAmount,
          },
        };
      } catch (error) {
        console.error("Error processing Stripe payment:", error);
        throw new Error("Failed to process payment");
      }
    }),
});
