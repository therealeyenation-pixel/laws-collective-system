import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";

export const contractorInvoicesRouter = router({
  // Get all invoices for a contractor
  getContractorInvoices: protectedProcedure
    .input(z.object({ 
      contractorId: z.number().optional(),
      status: z.enum(['draft', 'submitted', 'approved', 'rejected', 'paid', 'overdue', 'cancelled']).optional()
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      
      let query = `SELECT * FROM contractor_invoices WHERE 1=1`;
      const params: any[] = [];
      
      if (input.contractorId) {
        query += ` AND contractorId = ?`;
        params.push(input.contractorId);
      }
      
      if (input.status) {
        query += ` AND status = ?`;
        params.push(input.status);
      }
      
      query += ` ORDER BY invoiceDate DESC`;
      
      const [invoices] = await db.execute(query, params);
      return invoices as any[];
    }),

  // Get single invoice with line items
  getInvoice: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      
      const [invoices] = await db.execute(
        `SELECT * FROM contractor_invoices WHERE id = ?`,
        [input.invoiceId]
      );
      const invoice = (invoices as any[])[0];
      
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
      const [lineItems] = await db.execute(
        `SELECT * FROM invoice_line_items WHERE invoiceId = ? ORDER BY id`,
        [input.invoiceId]
      );
      
      const [payments] = await db.execute(
        `SELECT * FROM invoice_payments WHERE invoiceId = ? ORDER BY paymentDate DESC`,
        [input.invoiceId]
      );
      
      return {
        ...invoice,
        lineItems: lineItems as any[],
        payments: payments as any[]
      };
    }),

  // Create new invoice
  createInvoice: protectedProcedure
    .input(z.object({
      contractorId: z.number(),
      contractorBusinessId: z.number().optional(),
      clientEntityId: z.number().optional(),
      contractId: z.number().optional(),
      sowId: z.number().optional(),
      invoiceDate: z.string(),
      dueDate: z.string(),
      periodStart: z.string().optional(),
      periodEnd: z.string().optional(),
      paymentTerms: z.string().optional(),
      notes: z.string().optional(),
      lineItems: z.array(z.object({
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
        category: z.enum(['labor', 'materials', 'expenses', 'retainer', 'milestone', 'other']).optional(),
        projectName: z.string().optional(),
        hoursWorked: z.number().optional(),
        hourlyRate: z.number().optional()
      }))
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      // Generate invoice number
      const [countResult] = await db.execute(
        `SELECT COUNT(*) as count FROM contractor_invoices WHERE contractorId = ?`,
        [input.contractorId]
      );
      const count = (countResult as any[])[0].count + 1;
      const invoiceNumber = `INV-${input.contractorId}-${String(count).padStart(4, '0')}`;
      
      // Calculate totals
      const subtotal = input.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const taxAmount = 0; // Can be calculated based on tax rate
      const totalAmount = subtotal + taxAmount;
      
      // Insert invoice
      const [result] = await db.execute(
        `INSERT INTO contractor_invoices 
         (invoiceNumber, contractorId, contractorBusinessId, clientEntityId, contractId, sowId,
          invoiceDate, dueDate, periodStart, periodEnd, subtotal, taxAmount, totalAmount,
          paymentTerms, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
        [
          invoiceNumber,
          input.contractorId,
          input.contractorBusinessId || null,
          input.clientEntityId || null,
          input.contractId || null,
          input.sowId || null,
          input.invoiceDate,
          input.dueDate,
          input.periodStart || null,
          input.periodEnd || null,
          subtotal,
          taxAmount,
          totalAmount,
          input.paymentTerms || 'Net 30',
          input.notes || null
        ]
      );
      
      const invoiceId = (result as any).insertId;
      
      // Insert line items
      for (const item of input.lineItems) {
        const amount = item.quantity * item.unitPrice;
        await db.execute(
          `INSERT INTO invoice_line_items 
           (invoiceId, description, quantity, unitPrice, amount, category, projectName, hoursWorked, hourlyRate)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            invoiceId,
            item.description,
            item.quantity,
            item.unitPrice,
            amount,
            item.category || 'labor',
            item.projectName || null,
            item.hoursWorked || null,
            item.hourlyRate || null
          ]
        );
      }
      
      return {
        success: true,
        invoiceId,
        invoiceNumber
      };
    }),

  // Submit invoice for approval
  submitInvoice: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      await db.execute(
        `UPDATE contractor_invoices 
         SET status = 'submitted', submittedAt = NOW()
         WHERE id = ? AND status = 'draft'`,
        [input.invoiceId]
      );
      
      return { success: true };
    }),

  // Approve invoice
  approveInvoice: protectedProcedure
    .input(z.object({ 
      invoiceId: z.number(),
      approvedBy: z.number()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      await db.execute(
        `UPDATE contractor_invoices 
         SET status = 'approved', approvedAt = NOW(), approvedBy = ?
         WHERE id = ? AND status = 'submitted'`,
        [input.approvedBy, input.invoiceId]
      );
      
      return { success: true };
    }),

  // Reject invoice
  rejectInvoice: protectedProcedure
    .input(z.object({ 
      invoiceId: z.number(),
      reason: z.string()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      await db.execute(
        `UPDATE contractor_invoices 
         SET status = 'rejected', notes = CONCAT(IFNULL(notes, ''), '\n[REJECTED] ', ?)
         WHERE id = ? AND status = 'submitted'`,
        [input.reason, input.invoiceId]
      );
      
      return { success: true };
    }),

  // Record payment
  recordPayment: protectedProcedure
    .input(z.object({
      invoiceId: z.number(),
      paymentDate: z.string(),
      amount: z.number(),
      paymentMethod: z.enum(['ach', 'wire', 'check', 'credit_card', 'paypal', 'other']),
      referenceNumber: z.string().optional(),
      notes: z.string().optional(),
      processedBy: z.number()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      // Record payment
      await db.execute(
        `INSERT INTO invoice_payments 
         (invoiceId, paymentDate, amount, paymentMethod, referenceNumber, notes, processedBy)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          input.invoiceId,
          input.paymentDate,
          input.amount,
          input.paymentMethod,
          input.referenceNumber || null,
          input.notes || null,
          input.processedBy
        ]
      );
      
      // Check if fully paid
      const [invoice] = await db.execute(
        `SELECT totalAmount FROM contractor_invoices WHERE id = ?`,
        [input.invoiceId]
      );
      const totalAmount = parseFloat((invoice as any[])[0].totalAmount);
      
      const [payments] = await db.execute(
        `SELECT SUM(amount) as totalPaid FROM invoice_payments WHERE invoiceId = ?`,
        [input.invoiceId]
      );
      const totalPaid = parseFloat((payments as any[])[0].totalPaid || 0);
      
      if (totalPaid >= totalAmount) {
        await db.execute(
          `UPDATE contractor_invoices 
           SET status = 'paid', paidAt = NOW(), paymentMethod = ?, paymentReference = ?
           WHERE id = ?`,
          [input.paymentMethod, input.referenceNumber || null, input.invoiceId]
        );
      }
      
      return { success: true, fullyPaid: totalPaid >= totalAmount };
    }),

  // Get invoice dashboard stats
  getInvoiceStats: protectedProcedure
    .input(z.object({ contractorId: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      
      let whereClause = '';
      const params: any[] = [];
      
      if (input.contractorId) {
        whereClause = 'WHERE contractorId = ?';
        params.push(input.contractorId);
      }
      
      const [stats] = await db.execute(
        `SELECT 
           COUNT(*) as totalInvoices,
           SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draftCount,
           SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submittedCount,
           SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedCount,
           SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paidCount,
           SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdueCount,
           SUM(CASE WHEN status = 'paid' THEN totalAmount ELSE 0 END) as totalPaid,
           SUM(CASE WHEN status IN ('submitted', 'approved') THEN totalAmount ELSE 0 END) as totalPending,
           SUM(CASE WHEN status = 'overdue' THEN totalAmount ELSE 0 END) as totalOverdue
         FROM contractor_invoices ${whereClause}`,
        params
      );
      
      return (stats as any[])[0];
    }),

  // Get all invoices for admin view
  getAllInvoices: protectedProcedure
    .input(z.object({
      status: z.enum(['draft', 'submitted', 'approved', 'rejected', 'paid', 'overdue', 'cancelled']).optional(),
      limit: z.number().optional(),
      offset: z.number().optional()
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      
      let query = `SELECT ci.*, cb.businessName, cb.ownerName
                   FROM contractor_invoices ci
                   LEFT JOIN contractor_businesses cb ON ci.contractorBusinessId = cb.id
                   WHERE 1=1`;
      const params: any[] = [];
      
      if (input.status) {
        query += ` AND ci.status = ?`;
        params.push(input.status);
      }
      
      query += ` ORDER BY ci.invoiceDate DESC`;
      
      if (input.limit) {
        query += ` LIMIT ?`;
        params.push(input.limit);
        if (input.offset) {
          query += ` OFFSET ?`;
          params.push(input.offset);
        }
      }
      
      const [invoices] = await db.execute(query, params);
      return invoices as any[];
    }),

  // Mark overdue invoices
  markOverdueInvoices: protectedProcedure.mutation(async () => {
    const db = await getDb();
    
    const [result] = await db.execute(
      `UPDATE contractor_invoices 
       SET status = 'overdue'
       WHERE status IN ('submitted', 'approved') 
       AND dueDate < CURDATE()`
    );
    
    return { 
      success: true, 
      updatedCount: (result as any).affectedRows 
    };
  })
});
