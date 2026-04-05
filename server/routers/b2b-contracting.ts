import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  businessEntities,
  houses,
  employerTaxForms,
} from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ============================================
// B2B CONTRACTING ROUTER
// Handles Business-to-Business Service Agreements
// Uses in-memory storage until dedicated tables are created
// ============================================

// Temporary in-memory storage for agreements (will be replaced with DB table)
const serviceAgreements: Map<string, any> = new Map();
const contractPayments: Map<string, any[]> = new Map();
const contractInvoices: Map<string, any[]> = new Map();

export const b2bContractingRouter = router({
  // ============================================
  // SERVICE AGREEMENT CRUD
  // ============================================

  /**
   * Create a service agreement between two business entities
   */
  createServiceAgreement: protectedProcedure
    .input(
      z.object({
        clientBusinessId: z.number(),
        contractorBusinessId: z.number(),
        agreementTitle: z.string().min(1),
        scopeOfWork: z.string().min(1),
        deliverables: z.array(z.string()).optional(),
        compensationType: z.enum(["fixed_fee", "hourly", "retainer", "commission", "milestone"]),
        fixedFeeAmount: z.number().optional(),
        hourlyRate: z.number().optional(),
        retainerAmount: z.number().optional(),
        commissionRate: z.number().optional(),
        estimatedHours: z.number().optional(),
        paymentTerms: z.enum(["due_on_receipt", "net_15", "net_30", "net_60", "milestone"]),
        startDate: z.string(),
        endDate: z.string().optional(),
        autoRenew: z.boolean().default(false),
        renewalTermMonths: z.number().optional(),
        terminationNoticeDays: z.number().default(30),
        applyPlatformFee: z.boolean().default(true),
        platformFeePercent: z.number().default(30),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Verify both businesses exist
      const [clientBiz] = await db.select().from(businessEntities).where(eq(businessEntities.id, input.clientBusinessId)).limit(1);
      const [contractorBiz] = await db.select().from(businessEntities).where(eq(businessEntities.id, input.contractorBusinessId)).limit(1);

      if (!clientBiz) throw new TRPCError({ code: "NOT_FOUND", message: "Client business not found" });
      if (!contractorBiz) throw new TRPCError({ code: "NOT_FOUND", message: "Contractor business not found" });

      // Get house for this user
      const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
      const houseId = userHouse?.id || 1;

      // Calculate total contract value
      let estimatedValue = 0;
      if (input.compensationType === "fixed_fee" && input.fixedFeeAmount) {
        estimatedValue = input.fixedFeeAmount;
      } else if (input.compensationType === "hourly" && input.hourlyRate && input.estimatedHours) {
        estimatedValue = input.hourlyRate * input.estimatedHours;
      } else if (input.compensationType === "retainer" && input.retainerAmount) {
        const startDate = new Date(input.startDate);
        const endDate = input.endDate ? new Date(input.endDate) : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
        const months = Math.ceil((endDate.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000));
        estimatedValue = input.retainerAmount * months;
      }

      // Platform fee calculation
      const platformFee = input.applyPlatformFee ? estimatedValue * (input.platformFeePercent / 100) : 0;
      const contractorNetValue = estimatedValue - platformFee;

      // Generate agreement number
      const agreementNumber = `SA-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const agreement = {
        id: agreementNumber,
        houseId,
        clientBusiness: { id: clientBiz.id, name: clientBiz.name },
        contractorBusiness: { id: contractorBiz.id, name: contractorBiz.name },
        title: input.agreementTitle,
        scopeOfWork: input.scopeOfWork,
        deliverables: input.deliverables || [],
        compensation: {
          type: input.compensationType,
          fixedFee: input.fixedFeeAmount,
          hourlyRate: input.hourlyRate,
          retainer: input.retainerAmount,
          commission: input.commissionRate,
          estimatedHours: input.estimatedHours,
        },
        paymentTerms: input.paymentTerms,
        startDate: input.startDate,
        endDate: input.endDate,
        autoRenew: input.autoRenew,
        renewalTermMonths: input.renewalTermMonths,
        terminationNoticeDays: input.terminationNoticeDays,
        financials: {
          estimatedValue,
          platformFeePercent: input.platformFeePercent,
          platformFee,
          contractorNetValue,
          totalPaid: 0,
          totalPlatformFees: 0,
          totalContractorNet: 0,
        },
        status: "active",
        createdAt: new Date().toISOString(),
        createdBy: ctx.user.id,
      };

      serviceAgreements.set(agreementNumber, agreement);
      contractPayments.set(agreementNumber, []);
      contractInvoices.set(agreementNumber, []);

      return {
        success: true,
        agreementNumber,
        summary: {
          clientBusiness: clientBiz.name,
          contractorBusiness: contractorBiz.name,
          estimatedValue,
          platformFee,
          contractorNetValue,
        },
      };
    }),

  /**
   * Get all service agreements for a business
   */
  getAgreementsByBusiness: protectedProcedure
    .input(z.object({ businessId: z.number(), role: z.enum(["client", "contractor", "both"]).default("both") }))
    .query(async ({ input }) => {
      const agreements: any[] = [];
      
      serviceAgreements.forEach((agreement) => {
        if (input.role === "client" && agreement.clientBusiness.id === input.businessId) {
          agreements.push(agreement);
        } else if (input.role === "contractor" && agreement.contractorBusiness.id === input.businessId) {
          agreements.push(agreement);
        } else if (input.role === "both" && (agreement.clientBusiness.id === input.businessId || agreement.contractorBusiness.id === input.businessId)) {
          agreements.push(agreement);
        }
      });

      return agreements;
    }),

  /**
   * Get a single service agreement
   */
  getAgreement: protectedProcedure
    .input(z.object({ agreementNumber: z.string() }))
    .query(async ({ input }) => {
      const agreement = serviceAgreements.get(input.agreementNumber);
      if (!agreement) throw new TRPCError({ code: "NOT_FOUND", message: "Agreement not found" });

      return {
        ...agreement,
        payments: contractPayments.get(input.agreementNumber) || [],
        invoices: contractInvoices.get(input.agreementNumber) || [],
      };
    }),

  /**
   * Record a payment for a service agreement
   */
  recordContractPayment: protectedProcedure
    .input(z.object({
      agreementNumber: z.string(),
      paymentDate: z.string(),
      amount: z.number(),
      description: z.string().optional(),
      invoiceNumber: z.string().optional(),
      paymentMethod: z.enum(["check", "wire", "ach", "cash", "crypto"]).default("check"),
    }))
    .mutation(async ({ input, ctx }) => {
      const agreement = serviceAgreements.get(input.agreementNumber);
      if (!agreement) throw new TRPCError({ code: "NOT_FOUND", message: "Agreement not found" });

      const platformFeePercent = agreement.financials.platformFeePercent;
      const platformFee = input.amount * (platformFeePercent / 100);
      const contractorNet = input.amount - platformFee;

      const payments = contractPayments.get(input.agreementNumber) || [];
      const payment = {
        id: payments.length + 1,
        date: input.paymentDate,
        amount: input.amount,
        platformFee,
        contractorNet,
        description: input.description,
        invoiceNumber: input.invoiceNumber,
        paymentMethod: input.paymentMethod,
        recordedAt: new Date().toISOString(),
        recordedBy: ctx.user.id,
      };
      payments.push(payment);
      contractPayments.set(input.agreementNumber, payments);

      // Update totals
      agreement.financials.totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
      agreement.financials.totalPlatformFees = payments.reduce((sum: number, p: any) => sum + p.platformFee, 0);
      agreement.financials.totalContractorNet = payments.reduce((sum: number, p: any) => sum + p.contractorNet, 0);

      return {
        success: true,
        payment: { amount: input.amount, platformFee, contractorNet },
        totals: {
          totalPaid: agreement.financials.totalPaid,
          totalPlatformFees: agreement.financials.totalPlatformFees,
          totalContractorNet: agreement.financials.totalContractorNet,
        },
      };
    }),

  /**
   * Generate invoice for a service agreement
   */
  generateInvoice: protectedProcedure
    .input(z.object({
      agreementNumber: z.string(),
      invoiceDate: z.string(),
      dueDate: z.string(),
      lineItems: z.array(z.object({
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
      })),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const agreement = serviceAgreements.get(input.agreementNumber);
      if (!agreement) throw new TRPCError({ code: "NOT_FOUND", message: "Agreement not found" });

      const invoices = contractInvoices.get(input.agreementNumber) || [];
      const invoiceNumber = `INV-${input.agreementNumber}-${String(invoices.length + 1).padStart(3, "0")}`;

      const subtotal = input.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const platformFeePercent = agreement.financials.platformFeePercent;
      const platformFee = subtotal * (platformFeePercent / 100);

      const invoice = {
        invoiceNumber,
        invoiceDate: input.invoiceDate,
        dueDate: input.dueDate,
        from: agreement.contractorBusiness,
        to: agreement.clientBusiness,
        lineItems: input.lineItems,
        subtotal,
        platformFee,
        total: subtotal,
        notes: input.notes,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      invoices.push(invoice);
      contractInvoices.set(input.agreementNumber, invoices);

      return { success: true, invoiceNumber, invoice };
    }),

  /**
   * Generate 1099-NEC for a contractor business at year end
   */
  generate1099NEC: protectedProcedure
    .input(z.object({
      contractorBusinessId: z.number(),
      taxYear: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
      const houseId = userHouse?.id || 1;

      const [contractorBiz] = await db.select().from(businessEntities).where(eq(businessEntities.id, input.contractorBusinessId)).limit(1);
      if (!contractorBiz) throw new TRPCError({ code: "NOT_FOUND", message: "Contractor business not found" });

      // Calculate total payments for the year
      let totalPayments = 0;
      const agreementSummaries: any[] = [];

      serviceAgreements.forEach((agreement) => {
        if (agreement.contractorBusiness.id !== input.contractorBusinessId) return;

        const payments = contractPayments.get(agreement.id) || [];
        const yearPayments = payments.filter((p: any) => new Date(p.date).getFullYear() === input.taxYear);
        const yearTotal = yearPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

        if (yearTotal > 0) {
          totalPayments += yearTotal;
          agreementSummaries.push({
            agreementNumber: agreement.id,
            title: agreement.title,
            totalPaid: yearTotal,
          });
        }
      });

      if (totalPayments < 600) {
        return {
          success: false,
          message: `Total payments ($${totalPayments.toFixed(2)}) below $600 threshold. No 1099-NEC required.`,
          totalPayments,
        };
      }

      const [form] = await db.insert(employerTaxForms).values({
        positionHolderId: 0,
        businessEntityId: input.contractorBusinessId,
        houseId,
        taxYear: input.taxYear,
        documentType: "1099_nec",
        recipientName: contractorBiz.name,
        recipientSSN: "",
        recipientAddress: "",
        payerName: userHouse?.name || "House",
        payerEIN: "",
        payerAddress: "",
        nonemployeeCompensation: totalPayments.toFixed(2),
        status: "generated",
      });

      return {
        success: true,
        form1099Id: form.insertId,
        summary: {
          contractorBusiness: contractorBiz.name,
          taxYear: input.taxYear,
          totalPayments,
          agreements: agreementSummaries,
        },
      };
    }),

  /**
   * Terminate a service agreement
   */
  terminateAgreement: protectedProcedure
    .input(z.object({
      agreementNumber: z.string(),
      terminationDate: z.string(),
      reason: z.string(),
      finalPaymentAmount: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const agreement = serviceAgreements.get(input.agreementNumber);
      if (!agreement) throw new TRPCError({ code: "NOT_FOUND", message: "Agreement not found" });

      agreement.status = "terminated";
      agreement.terminationDate = input.terminationDate;
      agreement.terminationReason = input.reason;
      agreement.terminatedBy = ctx.user.id;
      agreement.terminatedAt = new Date().toISOString();

      if (input.finalPaymentAmount && input.finalPaymentAmount > 0) {
        const platformFee = input.finalPaymentAmount * (agreement.financials.platformFeePercent / 100);
        const payments = contractPayments.get(input.agreementNumber) || [];
        payments.push({
          id: payments.length + 1,
          date: input.terminationDate,
          amount: input.finalPaymentAmount,
          platformFee,
          contractorNet: input.finalPaymentAmount - platformFee,
          description: "Final payment upon termination",
          paymentMethod: "check",
          recordedAt: new Date().toISOString(),
          recordedBy: ctx.user.id,
        });
        contractPayments.set(input.agreementNumber, payments);
      }

      return { success: true, message: `Agreement terminated effective ${input.terminationDate}` };
    }),

  /**
   * Get B2B contracting dashboard
   */
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
    const houseId = userHouse?.id || 1;

    const allAgreements = Array.from(serviceAgreements.values()).filter((a) => a.houseId === houseId);
    const activeAgreements = allAgreements.filter((a) => a.status === "active");
    const terminatedAgreements = allAgreements.filter((a) => a.status === "terminated");

    let totalContractValue = 0;
    let totalPaid = 0;
    let totalPlatformFees = 0;

    for (const agreement of activeAgreements) {
      totalContractValue += agreement.financials.estimatedValue;
      totalPaid += agreement.financials.totalPaid;
      totalPlatformFees += agreement.financials.totalPlatformFees;
    }

    const allInvoices: any[] = [];
    contractInvoices.forEach((invoices) => {
      allInvoices.push(...invoices.filter((i) => i.status === "pending"));
    });

    return {
      summary: {
        activeAgreements: activeAgreements.length,
        terminatedAgreements: terminatedAgreements.length,
        totalContractValue,
        totalPaid,
        totalPlatformFees,
        pendingInvoices: allInvoices.length,
      },
      recentAgreements: activeAgreements.slice(0, 5),
      pendingInvoices: allInvoices.slice(0, 10),
    };
  }),
});

export default b2bContractingRouter;
