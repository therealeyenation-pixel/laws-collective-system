import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  foundingMembers,
  heirEducationBenefits,
  scholarshipPrograms,
  scholarshipApplications,
  scholarshipFund,
  scholarshipFundTransactions
} from "../../drizzle/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

/**
 * Scholarships Router
 * 
 * Manages:
 * 1. Founding Member registration and heir benefits
 * 2. Community scholarship programs
 * 3. Scholarship applications and review workflow
 * 4. Scholarship fund management
 */

export const scholarshipsRouter = router({
  // ============================================
  // FOUNDING MEMBERS
  // ============================================
  
  // Register a founding member
  registerFoundingMember: protectedProcedure
    .input(z.object({
      userId: z.number().optional(),
      houseId: z.string().optional(),
      fullName: z.string(),
      foundingDate: z.string(),
      foundingRole: z.enum(["primary_founder", "co_founder", "charter_member", "founding_investor"]),
      entityId: z.string().optional(),
      entityName: z.string().optional(),
      heirEducationBenefit: z.boolean().default(true),
      benefitGenerations: z.number().default(3),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(foundingMembers).values({
        userId: input.userId,
        houseId: input.houseId,
        fullName: input.fullName,
        foundingDate: new Date(input.foundingDate),
        foundingRole: input.foundingRole,
        entityId: input.entityId,
        entityName: input.entityName,
        heirEducationBenefit: input.heirEducationBenefit,
        benefitGenerations: input.benefitGenerations,
        verificationStatus: "verified",
        verifiedAt: new Date(),
        notes: input.notes,
      });

      return { id: result[0].insertId };
    }),

  // Get all founding members
  getFoundingMembers: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(foundingMembers)
      .orderBy(desc(foundingMembers.foundingDate));
  }),

  // Get founding member by ID
  getFoundingMemberById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const members = await db
        .select()
        .from(foundingMembers)
        .where(eq(foundingMembers.id, input.id))
        .limit(1);

      return members[0] || null;
    }),

  // ============================================
  // HEIR EDUCATION BENEFITS
  // ============================================

  // Register heir for education benefits
  registerHeirBenefit: protectedProcedure
    .input(z.object({
      heirUserId: z.number().optional(),
      heirHouseId: z.string().optional(),
      heirFullName: z.string(),
      foundingMemberId: z.number(),
      generationFromFounder: z.number(),
      lineagePath: z.array(z.string()).optional(),
      benefitType: z.enum(["full_tuition", "partial_tuition", "materials_only", "priority_enrollment"]).default("full_tuition"),
      coveragePercentage: z.number().default(100),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify founding member exists and has heir benefits enabled
      const founders = await db
        .select()
        .from(foundingMembers)
        .where(eq(foundingMembers.id, input.foundingMemberId))
        .limit(1);

      const founder = founders[0];
      if (!founder) throw new Error("Founding member not found");
      if (!founder.heirEducationBenefit) throw new Error("Founding member does not have heir education benefits enabled");
      if (input.generationFromFounder > founder.benefitGenerations) {
        throw new Error(`Heir is generation ${input.generationFromFounder}, but benefits only extend to generation ${founder.benefitGenerations}`);
      }

      const result = await db.insert(heirEducationBenefits).values({
        heirUserId: input.heirUserId,
        heirHouseId: input.heirHouseId,
        heirFullName: input.heirFullName,
        foundingMemberId: input.foundingMemberId,
        generationFromFounder: input.generationFromFounder,
        lineagePath: input.lineagePath ? JSON.stringify(input.lineagePath) : null,
        benefitType: input.benefitType,
        coveragePercentage: input.coveragePercentage,
        status: "eligible",
        notes: input.notes,
      });

      return { id: result[0].insertId };
    }),

  // Get heir benefits
  getHeirBenefits: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(heirEducationBenefits)
      .orderBy(desc(heirEducationBenefits.createdAt));
  }),

  // Get heir benefit by heir house ID
  getHeirBenefitByHouse: publicProcedure
    .input(z.object({ houseId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const benefits = await db
        .select()
        .from(heirEducationBenefits)
        .where(eq(heirEducationBenefits.heirHouseId, input.houseId))
        .limit(1);

      return benefits[0] || null;
    }),

  // Check if person is eligible for heir benefits
  checkHeirEligibility: publicProcedure
    .input(z.object({ 
      houseId: z.string().optional(),
      fullName: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { eligible: false, reason: "Database not available" };

      // Check by house ID first
      if (input.houseId) {
        const benefits = await db
          .select()
          .from(heirEducationBenefits)
          .where(eq(heirEducationBenefits.heirHouseId, input.houseId))
          .limit(1);

        if (benefits[0]) {
          return {
            eligible: true,
            benefitType: benefits[0].benefitType,
            coveragePercentage: benefits[0].coveragePercentage,
            status: benefits[0].status,
          };
        }
      }

      // Check if they're a founding member themselves
      if (input.houseId) {
        const founders = await db
          .select()
          .from(foundingMembers)
          .where(eq(foundingMembers.houseId, input.houseId))
          .limit(1);

        if (founders[0]) {
          return {
            eligible: true,
            benefitType: "full_tuition",
            coveragePercentage: 100,
            status: "eligible",
            isFoundingMember: true,
          };
        }
      }

      return { eligible: false, reason: "No heir benefits found for this person" };
    }),

  // Activate heir enrollment
  activateHeirEnrollment: protectedProcedure
    .input(z.object({
      benefitId: z.number(),
      academyEnrollmentId: z.number(),
      tuitionValue: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(heirEducationBenefits)
        .set({
          academyEnrollmentId: input.academyEnrollmentId,
          enrollmentDate: new Date(),
          tuitionValue: input.tuitionValue.toString(),
          status: "enrolled",
        })
        .where(eq(heirEducationBenefits.id, input.benefitId));

      return { success: true };
    }),

  // ============================================
  // SCHOLARSHIP PROGRAMS
  // ============================================

  // Create scholarship program
  createProgram: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      scholarshipType: z.enum([
        "merit_based", "need_based", "community_service", "entrepreneurship",
        "legacy", "diversity", "stem", "arts", "full_ride"
      ]),
      coverageType: z.enum(["full_tuition", "partial_tuition", "stipend", "materials", "comprehensive"]),
      coverageAmount: z.number().optional(),
      coveragePercentage: z.number().optional(),
      minAge: z.number().optional(),
      maxAge: z.number().optional(),
      minGPA: z.number().optional(),
      requiredCommunityHours: z.number().optional(),
      incomeThreshold: z.number().optional(),
      eligibilityCriteria: z.record(z.string(), z.any()).optional(),
      applicationStartDate: z.string().optional(),
      applicationEndDate: z.string().optional(),
      awardDate: z.string().optional(),
      totalSlots: z.number().default(10),
      fundingSource: z.string().optional(),
      totalBudget: z.number().optional(),
      renewable: z.boolean().default(true),
      maxRenewalYears: z.number().default(4),
      renewalCriteria: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(scholarshipPrograms).values({
        name: input.name,
        description: input.description,
        scholarshipType: input.scholarshipType,
        coverageType: input.coverageType,
        coverageAmount: input.coverageAmount?.toString(),
        coveragePercentage: input.coveragePercentage,
        minAge: input.minAge,
        maxAge: input.maxAge,
        minGPA: input.minGPA?.toString(),
        requiredCommunityHours: input.requiredCommunityHours,
        incomeThreshold: input.incomeThreshold?.toString(),
        eligibilityCriteria: input.eligibilityCriteria,
        applicationStartDate: input.applicationStartDate ? new Date(input.applicationStartDate) : null,
        applicationEndDate: input.applicationEndDate ? new Date(input.applicationEndDate) : null,
        awardDate: input.awardDate ? new Date(input.awardDate) : null,
        totalSlots: input.totalSlots,
        fundingSource: input.fundingSource,
        totalBudget: input.totalBudget?.toString(),
        remainingBudget: input.totalBudget?.toString(),
        renewable: input.renewable,
        maxRenewalYears: input.maxRenewalYears,
        renewalCriteria: input.renewalCriteria,
        status: "draft",
      });

      return { id: result[0].insertId };
    }),

  // Get all scholarship programs
  getPrograms: publicProcedure
    .input(z.object({ 
      status: z.enum(["draft", "active", "closed", "suspended", "archived"]).optional(),
      type: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db.select().from(scholarshipPrograms);
      
      if (input?.status) {
        query = query.where(eq(scholarshipPrograms.status, input.status)) as any;
      }

      return await query.orderBy(desc(scholarshipPrograms.createdAt));
    }),

  // Get active programs (for applicants)
  getActivePrograms: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const now = new Date();
    
    return await db
      .select()
      .from(scholarshipPrograms)
      .where(eq(scholarshipPrograms.status, "active"))
      .orderBy(scholarshipPrograms.applicationEndDate);
  }),

  // Update program status
  updateProgramStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "active", "closed", "suspended", "archived"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(scholarshipPrograms)
        .set({ status: input.status })
        .where(eq(scholarshipPrograms.id, input.id));

      return { success: true };
    }),

  // ============================================
  // SCHOLARSHIP APPLICATIONS
  // ============================================

  // Submit application
  submitApplication: publicProcedure
    .input(z.object({
      applicantUserId: z.number().optional(),
      applicantFullName: z.string(),
      applicantEmail: z.string().optional(),
      applicantPhone: z.string().optional(),
      applicantAddress: z.string().optional(),
      dateOfBirth: z.string().optional(),
      scholarshipProgramId: z.number(),
      currentEducationLevel: z.enum([
        "middle_school", "high_school", "ged_program", "community_college",
        "university", "graduate_school", "academy_enrolled", "other"
      ]).optional(),
      schoolName: z.string().optional(),
      gpa: z.number().optional(),
      expectedGraduation: z.string().optional(),
      householdIncome: z.number().optional(),
      householdSize: z.number().optional(),
      financialNeedStatement: z.string().optional(),
      communityServiceHours: z.number().optional(),
      communityServiceDescription: z.string().optional(),
      personalStatement: z.string().optional(),
      goalsStatement: z.string().optional(),
      transcriptUrl: z.string().optional(),
      recommendationLetters: z.array(z.string()).optional(),
      additionalDocuments: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify program exists and is active
      const programs = await db
        .select()
        .from(scholarshipPrograms)
        .where(eq(scholarshipPrograms.id, input.scholarshipProgramId))
        .limit(1);

      const program = programs[0];
      if (!program) throw new Error("Scholarship program not found");
      if (program.status !== "active") throw new Error("Scholarship program is not accepting applications");

      // Check if slots available
      if (program.filledSlots >= program.totalSlots && !program.waitlistEnabled) {
        throw new Error("No slots available for this scholarship");
      }

      const result = await db.insert(scholarshipApplications).values({
        applicantUserId: input.applicantUserId,
        applicantFullName: input.applicantFullName,
        applicantEmail: input.applicantEmail,
        applicantPhone: input.applicantPhone,
        applicantAddress: input.applicantAddress,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        scholarshipProgramId: input.scholarshipProgramId,
        currentEducationLevel: input.currentEducationLevel,
        schoolName: input.schoolName,
        gpa: input.gpa?.toString(),
        expectedGraduation: input.expectedGraduation ? new Date(input.expectedGraduation) : null,
        householdIncome: input.householdIncome?.toString(),
        householdSize: input.householdSize,
        financialNeedStatement: input.financialNeedStatement,
        communityServiceHours: input.communityServiceHours,
        communityServiceDescription: input.communityServiceDescription,
        personalStatement: input.personalStatement,
        goalsStatement: input.goalsStatement,
        transcriptUrl: input.transcriptUrl,
        recommendationLetters: input.recommendationLetters,
        additionalDocuments: input.additionalDocuments,
        reviewStatus: "submitted",
      });

      return { id: result[0].insertId };
    }),

  // Get applications (for review)
  getApplications: protectedProcedure
    .input(z.object({
      programId: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db.select().from(scholarshipApplications);

      if (input?.programId) {
        query = query.where(eq(scholarshipApplications.scholarshipProgramId, input.programId)) as any;
      }

      return await query.orderBy(desc(scholarshipApplications.submittedAt));
    }),

  // Score application
  scoreApplication: protectedProcedure
    .input(z.object({
      applicationId: z.number(),
      academicScore: z.number().optional(),
      needScore: z.number().optional(),
      serviceScore: z.number().optional(),
      essayScore: z.number().optional(),
      reviewNotes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const totalScore = (input.academicScore || 0) + (input.needScore || 0) + 
                        (input.serviceScore || 0) + (input.essayScore || 0);

      await db
        .update(scholarshipApplications)
        .set({
          academicScore: input.academicScore,
          needScore: input.needScore,
          serviceScore: input.serviceScore,
          essayScore: input.essayScore,
          totalScore,
          reviewStatus: "under_review",
          reviewNotes: input.reviewNotes,
        })
        .where(eq(scholarshipApplications.id, input.applicationId));

      return { totalScore };
    }),

  // Approve/deny application
  reviewApplication: protectedProcedure
    .input(z.object({
      applicationId: z.number(),
      decision: z.enum(["approved", "denied", "waitlisted"]),
      awardAmount: z.number().optional(),
      reviewNotes: z.string().optional(),
      reviewedBy: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateData: any = {
        reviewStatus: input.decision,
        reviewedBy: input.reviewedBy,
        reviewedAt: new Date(),
        reviewNotes: input.reviewNotes,
      };

      if (input.decision === "approved" && input.awardAmount) {
        updateData.awardAmount = input.awardAmount.toString();
        updateData.awardedAt = new Date();
      }

      await db
        .update(scholarshipApplications)
        .set(updateData)
        .where(eq(scholarshipApplications.id, input.applicationId));

      // If approved, increment filled slots
      if (input.decision === "approved") {
        const apps = await db
          .select()
          .from(scholarshipApplications)
          .where(eq(scholarshipApplications.id, input.applicationId))
          .limit(1);

        if (apps[0]) {
          await db
            .update(scholarshipPrograms)
            .set({ filledSlots: sql`${scholarshipPrograms.filledSlots} + 1` })
            .where(eq(scholarshipPrograms.id, apps[0].scholarshipProgramId));
        }
      }

      return { success: true };
    }),

  // ============================================
  // SCHOLARSHIP FUND
  // ============================================

  // Create fund
  createFund: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      fundType: z.enum(["general", "endowment", "annual", "memorial", "corporate", "community"]),
      initialBalance: z.number().default(0),
      isEndowed: z.boolean().default(false),
      endowmentMinimum: z.number().optional(),
      annualSpendingRate: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(scholarshipFund).values({
        name: input.name,
        description: input.description,
        fundType: input.fundType,
        principalBalance: input.initialBalance.toString(),
        availableBalance: input.isEndowed ? "0" : input.initialBalance.toString(),
        isEndowed: input.isEndowed,
        endowmentMinimum: input.endowmentMinimum?.toString(),
        annualSpendingRate: input.annualSpendingRate?.toString(),
        status: input.isEndowed && input.initialBalance < (input.endowmentMinimum || 0) ? "building" : "active",
      });

      // Record initial transaction if balance > 0
      if (input.initialBalance > 0) {
        await db.insert(scholarshipFundTransactions).values({
          fundId: result[0].insertId,
          transactionType: "donation",
          amount: input.initialBalance.toString(),
          description: "Initial fund balance",
          balanceAfter: input.initialBalance.toString(),
        });
      }

      return { id: result[0].insertId };
    }),

  // Get all funds
  getFunds: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(scholarshipFund)
      .orderBy(desc(scholarshipFund.createdAt));
  }),

  // Add donation to fund
  addDonation: protectedProcedure
    .input(z.object({
      fundId: z.number(),
      amount: z.number(),
      donorName: z.string().optional(),
      donorId: z.number().optional(),
      description: z.string().optional(),
      referenceNumber: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get current fund
      const funds = await db
        .select()
        .from(scholarshipFund)
        .where(eq(scholarshipFund.id, input.fundId))
        .limit(1);

      const fund = funds[0];
      if (!fund) throw new Error("Fund not found");

      const newPrincipal = parseFloat(fund.principalBalance?.toString() || "0") + input.amount;
      const newAvailable = fund.isEndowed 
        ? parseFloat(fund.availableBalance?.toString() || "0") 
        : parseFloat(fund.availableBalance?.toString() || "0") + input.amount;

      // Update fund balance
      await db
        .update(scholarshipFund)
        .set({
          principalBalance: newPrincipal.toString(),
          availableBalance: newAvailable.toString(),
          status: fund.isEndowed && newPrincipal < parseFloat(fund.endowmentMinimum?.toString() || "0") 
            ? "building" 
            : "active",
        })
        .where(eq(scholarshipFund.id, input.fundId));

      // Record transaction
      await db.insert(scholarshipFundTransactions).values({
        fundId: input.fundId,
        transactionType: "donation",
        amount: input.amount.toString(),
        donorName: input.donorName,
        donorId: input.donorId,
        description: input.description,
        referenceNumber: input.referenceNumber,
        balanceAfter: newPrincipal.toString(),
      });

      return { newBalance: newPrincipal };
    }),

  // Get fund transactions
  getFundTransactions: publicProcedure
    .input(z.object({ fundId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(scholarshipFundTransactions)
        .where(eq(scholarshipFundTransactions.fundId, input.fundId))
        .orderBy(desc(scholarshipFundTransactions.processedAt));
    }),

  // ============================================
  // STATISTICS
  // ============================================

  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        foundingMembers: 0,
        heirBeneficiaries: 0,
        activePrograms: 0,
        totalApplications: 0,
        approvedApplications: 0,
        totalFundBalance: 0,
        totalAwarded: 0,
      };
    }

    const founders = await db.select().from(foundingMembers);
    const heirs = await db.select().from(heirEducationBenefits);
    const programs = await db.select().from(scholarshipPrograms);
    const applications = await db.select().from(scholarshipApplications);
    const funds = await db.select().from(scholarshipFund);

    const totalFundBalance = funds.reduce((sum, f) => 
      sum + parseFloat(f.principalBalance?.toString() || "0"), 0);
    
    const totalAwarded = applications
      .filter(a => a.reviewStatus === "approved")
      .reduce((sum, a) => sum + parseFloat(a.awardAmount?.toString() || "0"), 0);

    return {
      foundingMembers: founders.length,
      heirBeneficiaries: heirs.length,
      activePrograms: programs.filter(p => p.status === "active").length,
      totalApplications: applications.length,
      approvedApplications: applications.filter(a => a.reviewStatus === "approved").length,
      totalFundBalance,
      totalAwarded,
    };
  }),
});
