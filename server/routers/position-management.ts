import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  businessPositions,
  positionHolders,
  employmentDocuments,
  payrollRecords,
  employerTaxForms,
  complianceTasks,
  ytdTotals,
  businessEntities,
  houses,
} from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ============================================
// POSITION MANAGEMENT ROUTER
// Handles W-2 Employees, 1099 Contractors, and B2B Contracting
// ============================================

export const positionManagementRouter = router({
  // ============================================
  // POSITION CRUD
  // ============================================

  /**
   * Create a new position in a business entity
   */
  createPosition: protectedProcedure
    .input(
      z.object({
        businessEntityId: z.number(),
        title: z.string().min(1),
        department: z.string().optional(),
        description: z.string().optional(),
        responsibilities: z.array(z.string()).optional(),
        classificationType: z.enum([
          "w2_employee",
          "w2_officer",
          "1099_contractor",
          "k1_member",
          "volunteer",
          "board_member",
        ]),
        employmentType: z
          .enum(["full_time", "part_time", "seasonal", "temporary"])
          .optional(),
        exemptionStatus: z.enum(["exempt", "non_exempt"]).default("non_exempt"),
        compensationType: z.enum([
          "salary",
          "hourly",
          "commission",
          "fee",
          "guaranteed_payment",
          "profit_share",
          "stipend",
          "unpaid",
        ]),
        salaryAmount: z.number().optional(),
        hourlyRate: z.number().optional(),
        commissionRate: z.number().optional(),
        payFrequency: z
          .enum(["weekly", "biweekly", "semimonthly", "monthly", "per_project"])
          .default("biweekly"),
        benefitsEligible: z.boolean().default(false),
        requiresBackgroundCheck: z.boolean().default(false),
        requiresCourseCompletion: z.boolean().default(false),
        requiredCourseId: z.number().optional(),
        linkedSimulatorId: z.number().optional(),
        maxHolders: z.number().default(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get the house for this business entity
      const [entity] = await db.select().from(businessEntities).where(eq(businessEntities.id, input.businessEntityId)).limit(1);

      if (!entity) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Business entity not found" });
      }

      // Get house ID from user
      const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
      const houseId = userHouse?.id || 1;

      const [position] = await db.insert(businessPositions).values({
        businessEntityId: input.businessEntityId,
        houseId,
        title: input.title,
        department: input.department,
        description: input.description,
        responsibilities: input.responsibilities,
        classificationType: input.classificationType,
        employmentType: input.employmentType,
        exemptionStatus: input.exemptionStatus,
        compensationType: input.compensationType,
        salaryAmount: input.salaryAmount?.toString(),
        hourlyRate: input.hourlyRate?.toString(),
        commissionRate: input.commissionRate?.toString(),
        payFrequency: input.payFrequency,
        benefitsEligible: input.benefitsEligible,
        requiresBackgroundCheck: input.requiresBackgroundCheck,
        requiresCourseCompletion: input.requiresCourseCompletion,
        requiredCourseId: input.requiredCourseId,
        linkedSimulatorId: input.linkedSimulatorId,
        maxHolders: input.maxHolders,
        status: "open",
        currentHolders: 0,
      });

      return { success: true, positionId: position.insertId };
    }),

  /**
   * Get all positions across all entities
   */
  getAllPositions: protectedProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const positions = await db.select().from(businessPositions)
        .orderBy(desc(businessPositions.createdAt));

      return positions;
    }),

  /**
   * Get all positions for a business entity
   */
  getPositionsByEntity: protectedProcedure
    .input(z.object({ businessEntityId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const positions = await db.select().from(businessPositions)
        .where(eq(businessPositions.businessEntityId, input.businessEntityId))
        .orderBy(desc(businessPositions.createdAt));

      return positions;
    }),

  /**
   * Get all positions held by a person
   */
  getPositionsByPerson: protectedProcedure
    .input(z.object({ userId: z.number().optional(), email: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = input.userId || ctx.user.id;

      const holders = await db.select().from(positionHolders)
        .where(eq(positionHolders.userId, userId));

      // Get position details for each
      const positionsWithDetails = await Promise.all(
        holders.map(async (holder) => {
          const [position] = await db.select().from(businessPositions)
            .where(eq(businessPositions.id, holder.positionId)).limit(1);
          const [entity] = position
            ? await db.select().from(businessEntities)
                .where(eq(businessEntities.id, position.businessEntityId)).limit(1)
            : [null];

          return { ...holder, position, entity };
        })
      );

      return positionsWithDetails;
    }),

  /**
   * Update a position
   */
  updatePosition: protectedProcedure
    .input(
      z.object({
        positionId: z.number(),
        title: z.string().optional(),
        department: z.string().optional(),
        description: z.string().optional(),
        responsibilities: z.array(z.string()).optional(),
        salaryAmount: z.number().optional(),
        hourlyRate: z.number().optional(),
        status: z.enum(["open", "filled", "closed"]).optional(),
        maxHolders: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const { positionId, salaryAmount, hourlyRate, ...rest } = input;

      await db.update(businessPositions).set({
        ...rest,
        ...(salaryAmount !== undefined && { salaryAmount: salaryAmount.toString() }),
        ...(hourlyRate !== undefined && { hourlyRate: hourlyRate.toString() }),
      }).where(eq(businessPositions.id, positionId));

      return { success: true };
    }),

  // ============================================
  // W-2 EMPLOYEE ONBOARDING
  // ============================================

  /**
   * Assign a person to a position as W-2 employee
   */
  assignEmployee: protectedProcedure
    .input(
      z.object({
        positionId: z.number(),
        userId: z.number().optional(),
        fullName: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        dateOfBirth: z.string().optional(),
        ssn: z.string().optional(),
        relationshipType: z.enum([
          "family_blood", "family_marriage", "family_adopted",
          "close_friend", "business_partner", "employee",
        ]),
        specificRelationship: z.string().optional(),
        startDate: z.string(),
        actualSalary: z.number().optional(),
        actualHourlyRate: z.number().optional(),
        federalFilingStatus: z.enum([
          "single", "married_filing_jointly", "married_filing_separately", "head_of_household",
        ]).optional(),
        federalAllowances: z.number().default(0),
        additionalWithholding: z.number().default(0),
        bankName: z.string().optional(),
        bankRoutingNumber: z.string().optional(),
        bankAccountNumber: z.string().optional(),
        accountType: z.enum(["checking", "savings"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get position details
      const [position] = await db.select().from(businessPositions)
        .where(eq(businessPositions.id, input.positionId)).limit(1);

      if (!position) throw new TRPCError({ code: "NOT_FOUND", message: "Position not found" });
      if (position.status === "closed") throw new TRPCError({ code: "BAD_REQUEST", message: "Position is closed" });
      if (position.currentHolders && position.maxHolders && position.currentHolders >= position.maxHolders) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Position is already filled" });
      }

      // Create position holder
      const [holder] = await db.insert(positionHolders).values({
        positionId: input.positionId,
        userId: input.userId,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        address: input.address,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
        ssn: input.ssn,
        relationshipType: input.relationshipType,
        specificRelationship: input.specificRelationship,
        startDate: new Date(input.startDate),
        actualSalary: input.actualSalary?.toString(),
        actualHourlyRate: input.actualHourlyRate?.toString(),
        federalFilingStatus: input.federalFilingStatus,
        federalAllowances: input.federalAllowances,
        additionalWithholding: input.additionalWithholding?.toString(),
        bankName: input.bankName,
        bankRoutingNumber: input.bankRoutingNumber,
        bankAccountNumber: input.bankAccountNumber,
        accountType: input.accountType,
        status: "pending_onboarding",
        onboardingComplete: false,
      });

      // Update position holder count
      await db.update(businessPositions).set({
        currentHolders: sql`${businessPositions.currentHolders} + 1`,
        status: (position.currentHolders || 0) + 1 >= (position.maxHolders || 1) ? "filled" : "open",
      }).where(eq(businessPositions.id, input.positionId));

      // Create compliance tasks
      const complianceItems = [
        { taskType: "custom" as const, taskName: `Complete I-9 for ${input.fullName}`, description: "Employment eligibility verification within 3 days", dueDate: new Date(new Date(input.startDate).getTime() + 3 * 24 * 60 * 60 * 1000) },
        { taskType: "performance_review" as const, taskName: `90-day review for ${input.fullName}`, description: "Initial performance review", dueDate: new Date(new Date(input.startDate).getTime() + 90 * 24 * 60 * 60 * 1000) },
      ];

      for (const task of complianceItems) {
        await db.insert(complianceTasks).values({
          houseId: position.houseId,
          businessEntityId: position.businessEntityId,
          positionHolderId: holder.insertId,
          ...task,
          status: "upcoming",
        });
      }

      // Initialize YTD totals
      await db.insert(ytdTotals).values({
        positionHolderId: holder.insertId,
        taxYear: new Date().getFullYear(),
      });

      return { success: true, positionHolderId: holder.insertId, message: `${input.fullName} assigned. Onboarding documents needed.` };
    }),

  /**
   * Generate employment documents for a position holder
   */
  generateEmploymentDocuments: protectedProcedure
    .input(z.object({
      positionHolderId: z.number(),
      documentTypes: z.array(z.enum([
        "offer_letter", "employment_agreement", "w4_form", "i9_form",
        "job_description", "direct_deposit_form", "handbook_acknowledgment", "confidentiality_agreement",
      ])),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [holder] = await db.select().from(positionHolders).where(eq(positionHolders.id, input.positionHolderId)).limit(1);
      if (!holder) throw new TRPCError({ code: "NOT_FOUND", message: "Position holder not found" });

      const [position] = await db.select().from(businessPositions).where(eq(businessPositions.id, holder.positionId)).limit(1);
      if (!position) throw new TRPCError({ code: "NOT_FOUND", message: "Position not found" });

      const [entity] = await db.select().from(businessEntities).where(eq(businessEntities.id, position.businessEntityId)).limit(1);

      const generatedDocs = [];
      const requiresSignature = ["offer_letter", "employment_agreement", "w4_form", "i9_form", "direct_deposit_form", "handbook_acknowledgment", "confidentiality_agreement"];

      for (const docType of input.documentTypes) {
        const [doc] = await db.insert(employmentDocuments).values({
          positionHolderId: input.positionHolderId,
          positionId: position.id,
          houseId: position.houseId,
          documentType: docType,
          documentName: `${docType.replace(/_/g, " ").toUpperCase()} - ${holder.fullName}`,
          documentVersion: 1,
          requiresSignature: requiresSignature.includes(docType),
          effectiveDate: holder.startDate,
          status: "pending_signature",
        });

        generatedDocs.push({ id: doc.insertId, type: docType, name: `${docType.replace(/_/g, " ").toUpperCase()} - ${holder.fullName}` });
      }

      return { success: true, documents: generatedDocs, message: `Generated ${generatedDocs.length} documents for ${holder.fullName}` };
    }),

  /**
   * Mark document as signed
   */
  signDocument: protectedProcedure
    .input(z.object({ documentId: z.number(), signatureHash: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.update(employmentDocuments).set({
        signedAt: new Date(),
        signedByUserId: ctx.user.id,
        signatureHash: input.signatureHash || `SIG-${Date.now()}-${ctx.user.id}`,
        status: "signed",
      }).where(eq(employmentDocuments.id, input.documentId));

      // Check if all required docs are signed
      const [doc] = await db.select().from(employmentDocuments).where(eq(employmentDocuments.id, input.documentId)).limit(1);

      if (doc) {
        const allDocs = await db.select().from(employmentDocuments).where(eq(employmentDocuments.positionHolderId, doc.positionHolderId));
        const allSigned = allDocs.every((d) => !d.requiresSignature || d.status === "signed");

        if (allSigned) {
          await db.update(positionHolders).set({
            onboardingComplete: true,
            onboardingCompletedAt: new Date(),
            status: "active",
          }).where(eq(positionHolders.id, doc.positionHolderId));
        }
      }

      return { success: true };
    }),

  /**
   * Get onboarding status for a position holder
   */
  getOnboardingStatus: protectedProcedure
    .input(z.object({ positionHolderId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [holder] = await db.select().from(positionHolders).where(eq(positionHolders.id, input.positionHolderId)).limit(1);
      if (!holder) throw new TRPCError({ code: "NOT_FOUND", message: "Position holder not found" });

      const documents = await db.select().from(employmentDocuments).where(eq(employmentDocuments.positionHolderId, input.positionHolderId));
      const [position] = await db.select().from(businessPositions).where(eq(businessPositions.id, holder.positionId)).limit(1);

      return {
        holder,
        position,
        documents,
        onboardingComplete: holder.onboardingComplete,
        documentsStatus: {
          total: documents.length,
          signed: documents.filter((d) => d.status === "signed").length,
          pending: documents.filter((d) => d.status === "pending_signature").length,
        },
      };
    }),

  // ============================================
  // PAYROLL
  // ============================================

  /**
   * Record a payroll entry
   */
  recordPayroll: protectedProcedure
    .input(z.object({
      positionHolderId: z.number(),
      payPeriodStart: z.string(),
      payPeriodEnd: z.string(),
      payDate: z.string(),
      regularHours: z.number().default(0),
      overtimeHours: z.number().default(0),
      bonusPay: z.number().default(0),
      commissionPay: z.number().default(0),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [holder] = await db.select().from(positionHolders).where(eq(positionHolders.id, input.positionHolderId)).limit(1);
      if (!holder) throw new TRPCError({ code: "NOT_FOUND", message: "Position holder not found" });

      const [position] = await db.select().from(businessPositions).where(eq(businessPositions.id, holder.positionId)).limit(1);
      if (!position) throw new TRPCError({ code: "NOT_FOUND", message: "Position not found" });

      // Calculate pay
      const hourlyRate = parseFloat(holder.actualHourlyRate || position.hourlyRate || "0");
      const salary = parseFloat(holder.actualSalary || position.salaryAmount || "0");

      let regularPay = 0;
      let overtimePay = 0;

      if (position.compensationType === "hourly") {
        regularPay = input.regularHours * hourlyRate;
        overtimePay = input.overtimeHours * hourlyRate * 1.5;
      } else if (position.compensationType === "salary") {
        const periodsPerYear = position.payFrequency === "weekly" ? 52 : position.payFrequency === "biweekly" ? 26 : position.payFrequency === "semimonthly" ? 24 : 12;
        regularPay = salary / periodsPerYear;
      }

      const grossPay = regularPay + overtimePay + input.bonusPay + input.commissionPay;

      // Calculate taxes (simplified)
      const federalIncomeTax = grossPay * 0.22;
      const stateIncomeTax = grossPay * 0.05;
      const socialSecurityTax = Math.min(grossPay * 0.062, 160200 * 0.062);
      const medicareTax = grossPay * 0.0145;
      const totalDeductions = federalIncomeTax + stateIncomeTax + socialSecurityTax + medicareTax;
      const netPay = grossPay - totalDeductions;

      // Employer taxes
      const employerSocialSecurity = socialSecurityTax;
      const employerMedicare = medicareTax;
      const employerFuta = Math.min(grossPay * 0.006, 7000 * 0.006);
      const employerSuta = grossPay * 0.027;

      const [payroll] = await db.insert(payrollRecords).values({
        positionHolderId: input.positionHolderId,
        positionId: position.id,
        businessEntityId: position.businessEntityId,
        houseId: position.houseId,
        payPeriodStart: new Date(input.payPeriodStart),
        payPeriodEnd: new Date(input.payPeriodEnd),
        payDate: new Date(input.payDate),
        regularHours: input.regularHours.toString(),
        overtimeHours: input.overtimeHours.toString(),
        grossPay: grossPay.toFixed(2),
        regularPay: regularPay.toFixed(2),
        overtimePay: overtimePay.toFixed(2),
        bonusPay: input.bonusPay.toFixed(2),
        commissionPay: input.commissionPay.toFixed(2),
        federalIncomeTax: federalIncomeTax.toFixed(2),
        stateIncomeTax: stateIncomeTax.toFixed(2),
        socialSecurityTax: socialSecurityTax.toFixed(2),
        medicareTax: medicareTax.toFixed(2),
        totalDeductions: totalDeductions.toFixed(2),
        netPay: netPay.toFixed(2),
        employerSocialSecurity: employerSocialSecurity.toFixed(2),
        employerMedicare: employerMedicare.toFixed(2),
        employerFuta: employerFuta.toFixed(2),
        employerSuta: employerSuta.toFixed(2),
        paymentMethod: holder.bankAccountNumber ? "direct_deposit" : "check",
        status: "pending",
        createdBy: ctx.user.id,
      });

      // Update YTD totals
      const currentYear = new Date().getFullYear();
      await db.update(ytdTotals).set({
        ytdGrossPay: sql`${ytdTotals.ytdGrossPay} + ${grossPay}`,
        ytdRegularPay: sql`${ytdTotals.ytdRegularPay} + ${regularPay}`,
        ytdOvertimePay: sql`${ytdTotals.ytdOvertimePay} + ${overtimePay}`,
        ytdBonusPay: sql`${ytdTotals.ytdBonusPay} + ${input.bonusPay}`,
        ytdFederalTax: sql`${ytdTotals.ytdFederalTax} + ${federalIncomeTax}`,
        ytdStateTax: sql`${ytdTotals.ytdStateTax} + ${stateIncomeTax}`,
        ytdSocialSecurity: sql`${ytdTotals.ytdSocialSecurity} + ${socialSecurityTax}`,
        ytdMedicare: sql`${ytdTotals.ytdMedicare} + ${medicareTax}`,
        ytdNetPay: sql`${ytdTotals.ytdNetPay} + ${netPay}`,
        ytdRegularHours: sql`${ytdTotals.ytdRegularHours} + ${input.regularHours}`,
        ytdOvertimeHours: sql`${ytdTotals.ytdOvertimeHours} + ${input.overtimeHours}`,
        lastPayrollRecordId: payroll.insertId,
      }).where(and(eq(ytdTotals.positionHolderId, input.positionHolderId), eq(ytdTotals.taxYear, currentYear)));

      return {
        success: true,
        payrollId: payroll.insertId,
        summary: { grossPay, totalDeductions, netPay, employerCost: grossPay + employerSocialSecurity + employerMedicare + employerFuta + employerSuta },
      };
    }),

  /**
   * Get payroll history for a position holder
   */
  getPayrollHistory: protectedProcedure
    .input(z.object({ positionHolderId: z.number(), year: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const records = await db.select().from(payrollRecords)
        .where(eq(payrollRecords.positionHolderId, input.positionHolderId))
        .orderBy(desc(payrollRecords.payDate));

      const [ytd] = await db.select().from(ytdTotals)
        .where(and(eq(ytdTotals.positionHolderId, input.positionHolderId), eq(ytdTotals.taxYear, input.year || new Date().getFullYear())))
        .limit(1);

      return { records, ytdTotals: ytd };
    }),

  // ============================================
  // TAX DOCUMENTS
  // ============================================

  /**
   * Generate W-2 for an employee
   */
  generateW2: protectedProcedure
    .input(z.object({ positionHolderId: z.number(), taxYear: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [holder] = await db.select().from(positionHolders).where(eq(positionHolders.id, input.positionHolderId)).limit(1);
      if (!holder) throw new TRPCError({ code: "NOT_FOUND", message: "Position holder not found" });

      const [position] = await db.select().from(businessPositions).where(eq(businessPositions.id, holder.positionId)).limit(1);
      if (!position) throw new TRPCError({ code: "NOT_FOUND", message: "Position not found" });

      const [entity] = await db.select().from(businessEntities).where(eq(businessEntities.id, position.businessEntityId)).limit(1);

      const [ytd] = await db.select().from(ytdTotals)
        .where(and(eq(ytdTotals.positionHolderId, input.positionHolderId), eq(ytdTotals.taxYear, input.taxYear))).limit(1);

      if (!ytd) throw new TRPCError({ code: "NOT_FOUND", message: "No payroll records found for this year" });

      const [w2] = await db.insert(employerTaxForms).values({
        positionHolderId: input.positionHolderId,
        businessEntityId: position.businessEntityId,
        houseId: position.houseId,
        taxYear: input.taxYear,
        documentType: "w2",
        recipientName: holder.fullName,
        recipientSSN: holder.ssn,
        recipientAddress: holder.address,
        payerName: entity?.name || "Unknown",
        payerEIN: "00-0000000", // EIN stored separately or in financialStructure
        payerAddress: "", // Address stored separately
        wagesBox1: ytd.ytdGrossPay,
        federalWithheldBox2: ytd.ytdFederalTax,
        socialSecurityWagesBox3: ytd.ytdGrossPay,
        socialSecurityWithheldBox4: ytd.ytdSocialSecurity,
        medicareWagesBox5: ytd.ytdGrossPay,
        medicareWithheldBox6: ytd.ytdMedicare,
        stateWagesBox16: ytd.ytdGrossPay,
        stateWithheldBox17: ytd.ytdStateTax,
        status: "generated",
      });

      return { success: true, w2Id: w2.insertId, message: `W-2 generated for ${holder.fullName} for tax year ${input.taxYear}` };
    }),

  // ============================================
  // TERMINATION
  // ============================================

  /**
   * Terminate an employee
   */
  terminateEmployee: protectedProcedure
    .input(z.object({ positionHolderId: z.number(), terminationDate: z.string(), reason: z.string(), generateFinalPaycheck: z.boolean().default(true) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [holder] = await db.select().from(positionHolders).where(eq(positionHolders.id, input.positionHolderId)).limit(1);
      if (!holder) throw new TRPCError({ code: "NOT_FOUND", message: "Position holder not found" });

      await db.update(positionHolders).set({
        status: "terminated",
        endDate: new Date(input.terminationDate),
        terminationReason: input.reason,
      }).where(eq(positionHolders.id, input.positionHolderId));

      await db.update(businessPositions).set({
        currentHolders: sql`${businessPositions.currentHolders} - 1`,
        status: "open",
      }).where(eq(businessPositions.id, holder.positionId));

      const [position] = await db.select().from(businessPositions).where(eq(businessPositions.id, holder.positionId)).limit(1);

      if (position) {
        await db.insert(employmentDocuments).values({
          positionHolderId: input.positionHolderId,
          positionId: position.id,
          houseId: position.houseId,
          documentType: "termination_letter",
          documentName: `Termination Letter - ${holder.fullName}`,
          documentVersion: 1,
          requiresSignature: false,
          effectiveDate: new Date(input.terminationDate),
          status: "signed",
        });
      }

      return { success: true, message: `${holder.fullName} terminated effective ${input.terminationDate}` };
    }),

  // ============================================
  // DASHBOARD
  // ============================================

  /**
   * Get employment dashboard overview
   */
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
    const houseId = userHouse?.id || 1;

    const positions = await db.select().from(businessPositions).where(eq(businessPositions.houseId, houseId));

    // Get position holders for this house's positions
    const positionIds = positions.map(p => p.id);
    let holders: any[] = [];
    if (positionIds.length > 0) {
      holders = await db.select().from(positionHolders).where(sql`${positionHolders.positionId} IN (${sql.join(positionIds.map(id => sql`${id}`), sql`, `)})`);
    }

    const pendingTasks = await db.select().from(complianceTasks)
      .where(and(eq(complianceTasks.houseId, houseId), sql`${complianceTasks.status} IN ('upcoming', 'due_soon', 'overdue')`))
      .orderBy(complianceTasks.dueDate)
      .limit(10);

    const activeEmployees = holders.filter((h) => h.status === "active").length;
    const pendingOnboarding = holders.filter((h) => h.status === "pending_onboarding").length;
    const openPositions = positions.filter((p) => p.status === "open").length;

    return {
      summary: {
        totalPositions: positions.length,
        openPositions,
        activeEmployees,
        pendingOnboarding,
        totalW2Employees: positions.filter((p) => p.classificationType === "w2_employee" || p.classificationType === "w2_officer").length,
        totalContractors: positions.filter((p) => p.classificationType === "1099_contractor").length,
      },
      positions,
      employees: holders,
      upcomingTasks: pendingTasks,
    };
  }),
});

export default positionManagementRouter;
