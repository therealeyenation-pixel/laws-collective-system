import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

/**
 * Contingency Offers Router
 * 
 * Generates and manages contingency employment offers that activate upon funding.
 * 
 * KEY FEATURES:
 * - Letter of Intent generation
 * - Conditional Employment Offers
 * - Training Pre-Enrollment
 * - Equipment Reservation
 * - Funding Trigger Management
 * - Batch offer generation from candidate list
 */

// Offer status types
const offerStatuses = [
  "draft",
  "sent",
  "intent_accepted",    // Candidate signed letter of intent
  "intent_declined",    // Candidate declined
  "pending_funding",    // Waiting for funding trigger
  "activated",          // Funding received, offer is now active
  "converted",          // Converted to full employment
  "expired",            // Offer expired without funding
  "withdrawn",          // Offer withdrawn by company
] as const;

// Position types
const positionTypes = [
  "full_time",
  "part_time",
  "contractor",
  "intern",
  "consultant",
  "board_member",
] as const;

export const contingencyOffersRouter = router({
  // Get all contingency offers
  getOffers: protectedProcedure
    .input(z.object({
      status: z.enum(offerStatuses).optional(),
      positionType: z.enum(positionTypes).optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = sql`SELECT * FROM contingency_offers WHERE createdBy = ${ctx.user.id}`;
      
      if (input.status) {
        query = sql`${query} AND status = ${input.status}`;
      }
      if (input.positionType) {
        query = sql`${query} AND positionType = ${input.positionType}`;
      }
      
      query = sql`${query} ORDER BY createdAt DESC LIMIT ${input.limit} OFFSET ${input.offset}`;
      
      const offers = await db.execute(query);
      return offers as any[];
    }),

  // Get offer by ID
  getOfferById: protectedProcedure
    .input(z.object({ offerId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const offers = await db.execute(
        sql`SELECT * FROM contingency_offers WHERE id = ${input.offerId} AND createdBy = ${ctx.user.id}`
      );
      
      return (offers as any[])[0] || null;
    }),

  // Get dashboard stats
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const statusCounts = await db.execute(
      sql`SELECT status, COUNT(*) as count FROM contingency_offers 
          WHERE createdBy = ${ctx.user.id} GROUP BY status`
    );

    const positionCounts = await db.execute(
      sql`SELECT positionType, COUNT(*) as count FROM contingency_offers 
          WHERE createdBy = ${ctx.user.id} GROUP BY positionType`
    );

    const totalCompensation = await db.execute(
      sql`SELECT SUM(annualCompensation) as total FROM contingency_offers 
          WHERE createdBy = ${ctx.user.id} AND status NOT IN ('expired', 'withdrawn', 'intent_declined')`
    );

    const recentOffers = await db.execute(
      sql`SELECT id, candidateName, positionTitle, status, createdAt 
          FROM contingency_offers WHERE createdBy = ${ctx.user.id}
          ORDER BY createdAt DESC LIMIT 10`
    );

    return {
      statusCounts: statusCounts as any[],
      positionCounts: positionCounts as any[],
      totalProjectedCompensation: (totalCompensation as any[])[0]?.total || 0,
      recentOffers: recentOffers as any[],
    };
  }),

  // Generate Letter of Intent
  generateLetterOfIntent: protectedProcedure
    .input(z.object({
      entityName: z.string(),
      candidateName: z.string(),
      candidateEmail: z.string().email().optional(),
      positionTitle: z.string(),
      positionType: z.enum(positionTypes),
      department: z.string().optional(),
      startDateEstimate: z.string(),
      fundingCondition: z.string(),
      keyResponsibilities: z.array(z.string()),
      compensationRange: z.object({
        min: z.number(),
        max: z.number(),
      }),
      benefits: z.array(z.string()),
      trainingRequirements: z.array(z.string()).optional(),
      expirationDate: z.string(),
    }))
    .mutation(async ({ input }) => {
      const {
        entityName, candidateName, positionTitle, positionType, department,
        startDateEstimate, fundingCondition, keyResponsibilities,
        compensationRange, benefits, trainingRequirements, expirationDate
      } = input;

      const letterOfIntent = {
        type: "letter_of_intent",
        documentTitle: "LETTER OF INTENT",
        subtitle: "Contingent Employment Opportunity",
        date: new Date().toISOString().split('T')[0],
        
        header: {
          from: entityName,
          to: candidateName,
          re: `Contingent Offer - ${positionTitle}`,
        },

        opening: `Dear ${candidateName},

We are pleased to express our intent to offer you the position of ${positionTitle}${department ? ` in our ${department} department` : ''} at ${entityName}. This letter outlines the terms of our contingent offer, which will become effective upon the fulfillment of certain funding conditions.`,

        contingencyClause: {
          title: "CONTINGENCY CONDITIONS",
          text: `This offer is contingent upon: ${fundingCondition}

Until these conditions are met, this letter represents our intent to employ you and is not a binding employment contract. Upon satisfaction of the contingency conditions, we will provide you with a formal employment offer.`,
        },

        positionDetails: {
          title: "POSITION DETAILS",
          items: [
            { label: "Position", value: positionTitle },
            { label: "Type", value: positionType.replace('_', ' ').toUpperCase() },
            { label: "Department", value: department || "To be determined" },
            { label: "Estimated Start Date", value: startDateEstimate },
            { label: "Reports To", value: "To be determined upon activation" },
          ],
        },

        responsibilities: {
          title: "KEY RESPONSIBILITIES",
          items: keyResponsibilities,
        },

        compensation: {
          title: "COMPENSATION (PROJECTED)",
          text: `Upon activation of this offer, your annual compensation is expected to be in the range of $${compensationRange.min.toLocaleString()} to $${compensationRange.max.toLocaleString()}, commensurate with experience and final budget allocation.`,
        },

        benefits: {
          title: "BENEFITS PACKAGE (PROJECTED)",
          items: benefits,
          note: "Final benefits package will be confirmed upon offer activation.",
        },

        preEmployment: {
          title: "PRE-EMPLOYMENT OPPORTUNITIES",
          text: trainingRequirements && trainingRequirements.length > 0
            ? `While awaiting funding confirmation, you are invited to participate in the following training and preparation activities at no cost:\n${trainingRequirements.map(t => `• ${t}`).join('\n')}`
            : "While awaiting funding confirmation, you may be invited to participate in orientation and training activities.",
        },

        acceptance: {
          title: "EXPRESSION OF INTEREST",
          text: `If you wish to express your interest in this contingent opportunity, please sign below. By signing, you acknowledge that:

1. This is a letter of intent, not a binding employment contract
2. The offer is contingent upon the conditions stated above
3. You are not obligated to accept the final offer when made
4. ${entityName} is not obligated to make a final offer if conditions are not met

This letter of intent expires on ${expirationDate}.`,
          signatureLines: [
            { label: "Candidate Signature", name: candidateName },
            { label: "Date", name: "" },
            { label: "Company Representative", name: "" },
            { label: "Date", name: "" },
          ],
        },

        generatedAt: new Date().toISOString(),
      };

      return letterOfIntent;
    }),

  // Generate Conditional Employment Offer
  generateConditionalOffer: protectedProcedure
    .input(z.object({
      entityName: z.string(),
      candidateName: z.string(),
      candidateEmail: z.string().email().optional(),
      candidateAddress: z.string().optional(),
      positionTitle: z.string(),
      positionType: z.enum(positionTypes),
      department: z.string().optional(),
      reportsTo: z.string().optional(),
      startDate: z.string(),
      fundingCondition: z.string(),
      fundingDeadline: z.string(),
      annualCompensation: z.number(),
      payFrequency: z.enum(["weekly", "biweekly", "semimonthly", "monthly"]),
      benefits: z.object({
        healthInsurance: z.boolean().default(false),
        dentalVision: z.boolean().default(false),
        retirement401k: z.boolean().default(false),
        retirementMatch: z.string().optional(),
        paidTimeOff: z.number().default(0),
        sickLeave: z.number().default(0),
        professionalDevelopment: z.number().default(0),
        remoteWork: z.boolean().default(false),
        equipmentProvided: z.boolean().default(false),
        otherBenefits: z.array(z.string()).optional(),
      }),
      equipmentPackage: z.array(z.string()).optional(),
      responsibilities: z.array(z.string()),
      requirements: z.array(z.string()).optional(),
      atWillStatement: z.boolean().default(true),
      responseDeadline: z.string(),
    }))
    .mutation(async ({ input }) => {
      const {
        entityName, candidateName, candidateAddress, positionTitle, positionType,
        department, reportsTo, startDate, fundingCondition, fundingDeadline,
        annualCompensation, payFrequency, benefits, equipmentPackage,
        responsibilities, requirements, atWillStatement, responseDeadline
      } = input;

      // Calculate pay per period
      const periodsPerYear = {
        weekly: 52,
        biweekly: 26,
        semimonthly: 24,
        monthly: 12,
      };
      const payPerPeriod = annualCompensation / periodsPerYear[payFrequency];

      const conditionalOffer = {
        type: "conditional_employment_offer",
        documentTitle: "CONDITIONAL EMPLOYMENT OFFER",
        date: new Date().toISOString().split('T')[0],
        
        header: {
          to: candidateName,
          address: candidateAddress || "",
          from: entityName,
        },

        opening: `Dear ${candidateName},

${entityName} is pleased to extend this conditional offer of employment for the position of ${positionTitle}. This offer is subject to the fulfillment of certain funding conditions as described below.`,

        contingency: {
          title: "CONTINGENCY CONDITIONS",
          condition: fundingCondition,
          deadline: fundingDeadline,
          text: `This offer will automatically convert to a binding employment agreement upon confirmation that the above conditions have been satisfied on or before ${fundingDeadline}. If the conditions are not met by this date, this offer will expire unless extended in writing by ${entityName}.`,
        },

        position: {
          title: "POSITION DETAILS",
          details: [
            { label: "Position Title", value: positionTitle },
            { label: "Employment Type", value: positionType.replace('_', ' ').toUpperCase() },
            { label: "Department", value: department || "General" },
            { label: "Reports To", value: reportsTo || "To be assigned" },
            { label: "Start Date", value: `${startDate} (contingent on funding confirmation)` },
            { label: "Work Location", value: benefits.remoteWork ? "Remote / Hybrid" : "On-site" },
          ],
        },

        compensation: {
          title: "COMPENSATION",
          annual: annualCompensation,
          perPeriod: payPerPeriod,
          frequency: payFrequency,
          text: `Your annual compensation will be $${annualCompensation.toLocaleString()}, paid ${payFrequency} ($${payPerPeriod.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per pay period), less applicable withholdings and deductions.`,
        },

        benefits: {
          title: "BENEFITS",
          items: [
            benefits.healthInsurance && "Health Insurance (Medical)",
            benefits.dentalVision && "Dental and Vision Insurance",
            benefits.retirement401k && `401(k) Retirement Plan${benefits.retirementMatch ? ` with ${benefits.retirementMatch} employer match` : ''}`,
            benefits.paidTimeOff > 0 && `${benefits.paidTimeOff} days Paid Time Off (PTO) annually`,
            benefits.sickLeave > 0 && `${benefits.sickLeave} days Sick Leave annually`,
            benefits.professionalDevelopment > 0 && `$${benefits.professionalDevelopment.toLocaleString()} Professional Development Budget`,
            benefits.remoteWork && "Remote/Hybrid Work Arrangement",
            benefits.equipmentProvided && "Company-Provided Equipment",
            ...(benefits.otherBenefits || []),
          ].filter(Boolean),
          note: "Benefits eligibility begins on your start date or as specified by plan documents.",
        },

        equipment: equipmentPackage && equipmentPackage.length > 0 ? {
          title: "EQUIPMENT PACKAGE",
          items: equipmentPackage,
          text: "The following equipment will be provided to you upon commencement of employment:",
        } : null,

        responsibilities: {
          title: "KEY RESPONSIBILITIES",
          items: responsibilities,
        },

        requirements: requirements && requirements.length > 0 ? {
          title: "REQUIREMENTS",
          items: requirements,
        } : null,

        atWill: atWillStatement ? {
          title: "AT-WILL EMPLOYMENT",
          text: `Employment with ${entityName} is "at-will," meaning that either you or ${entityName} may terminate the employment relationship at any time, with or without cause or notice. This offer letter does not constitute a contract of employment for any specific period.`,
        } : null,

        acceptance: {
          title: "ACCEPTANCE",
          deadline: responseDeadline,
          text: `To accept this conditional offer, please sign and return this letter by ${responseDeadline}. By signing below, you acknowledge that you have read, understood, and agree to the terms of this conditional employment offer.`,
          signatureBlock: {
            candidate: {
              signatureLine: true,
              printedName: candidateName,
              dateLine: true,
            },
            company: {
              signatureLine: true,
              printedName: "",
              title: "Authorized Representative",
              dateLine: true,
            },
          },
        },

        generatedAt: new Date().toISOString(),
      };

      return conditionalOffer;
    }),

  // Create/Save contingency offer to database
  createOffer: protectedProcedure
    .input(z.object({
      candidateName: z.string(),
      candidateEmail: z.string().email().optional(),
      candidatePhone: z.string().optional(),
      positionTitle: z.string(),
      positionType: z.enum(positionTypes),
      department: z.string().optional(),
      annualCompensation: z.number(),
      fundingCondition: z.string(),
      fundingDeadline: z.string(),
      offerData: z.any(),
      letterOfIntentData: z.any().optional(),
      status: z.enum(offerStatuses).default("draft"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.execute(
        sql`INSERT INTO contingency_offers 
            (createdBy, candidateName, candidateEmail, candidatePhone, positionTitle, 
             positionType, department, annualCompensation, fundingCondition, fundingDeadline,
             offerData, letterOfIntentData, status, createdAt, updatedAt)
            VALUES (${ctx.user.id}, ${input.candidateName}, ${input.candidateEmail || null}, 
                    ${input.candidatePhone || null}, ${input.positionTitle}, ${input.positionType},
                    ${input.department || null}, ${input.annualCompensation}, ${input.fundingCondition},
                    ${input.fundingDeadline}, ${JSON.stringify(input.offerData)}, 
                    ${input.letterOfIntentData ? JSON.stringify(input.letterOfIntentData) : null},
                    ${input.status}, NOW(), NOW())`
      );

      return { success: true, id: (result as any).insertId };
    }),

  // Batch create offers from candidate list
  batchCreateOffers: protectedProcedure
    .input(z.object({
      entityName: z.string(),
      fundingCondition: z.string(),
      fundingDeadline: z.string(),
      candidates: z.array(z.object({
        name: z.string(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        positionTitle: z.string(),
        positionType: z.enum(positionTypes),
        department: z.string().optional(),
        annualCompensation: z.number(),
        responsibilities: z.array(z.string()).optional(),
        benefits: z.array(z.string()).optional(),
        equipmentPackage: z.array(z.string()).optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const results = [];
      
      for (const candidate of input.candidates) {
        const offerData = {
          entityName: input.entityName,
          candidateName: candidate.name,
          positionTitle: candidate.positionTitle,
          positionType: candidate.positionType,
          department: candidate.department,
          annualCompensation: candidate.annualCompensation,
          fundingCondition: input.fundingCondition,
          fundingDeadline: input.fundingDeadline,
          responsibilities: candidate.responsibilities || [],
          benefits: candidate.benefits || [],
          equipmentPackage: candidate.equipmentPackage || [],
        };

        const result = await db.execute(
          sql`INSERT INTO contingency_offers 
              (createdBy, candidateName, candidateEmail, candidatePhone, positionTitle, 
               positionType, department, annualCompensation, fundingCondition, fundingDeadline,
               offerData, status, createdAt, updatedAt)
              VALUES (${ctx.user.id}, ${candidate.name}, ${candidate.email || null}, 
                      ${candidate.phone || null}, ${candidate.positionTitle}, ${candidate.positionType},
                      ${candidate.department || null}, ${candidate.annualCompensation}, 
                      ${input.fundingCondition}, ${input.fundingDeadline}, 
                      ${JSON.stringify(offerData)}, 'draft', NOW(), NOW())`
        );

        results.push({
          candidateName: candidate.name,
          id: (result as any).insertId,
          success: true,
        });
      }

      return {
        success: true,
        totalCreated: results.length,
        offers: results,
      };
    }),

  // Update offer status
  updateOfferStatus: protectedProcedure
    .input(z.object({
      offerId: z.number(),
      status: z.enum(offerStatuses),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.execute(
        sql`UPDATE contingency_offers 
            SET status = ${input.status}, 
                statusNotes = ${input.notes || null},
                updatedAt = NOW()
            WHERE id = ${input.offerId} AND createdBy = ${ctx.user.id}`
      );

      return { success: true };
    }),

  // Trigger funding activation - convert all pending offers to activated
  triggerFundingActivation: protectedProcedure
    .input(z.object({
      fundingSource: z.string(),
      fundingAmount: z.number(),
      activationDate: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get all offers pending funding
      const pendingOffers = await db.execute(
        sql`SELECT id, candidateName, positionTitle FROM contingency_offers 
            WHERE createdBy = ${ctx.user.id} 
            AND status IN ('intent_accepted', 'pending_funding')`
      );

      // Update all to activated
      await db.execute(
        sql`UPDATE contingency_offers 
            SET status = 'activated',
                activationDate = ${input.activationDate},
                fundingSource = ${input.fundingSource},
                fundingAmount = ${input.fundingAmount},
                activationNotes = ${input.notes || null},
                updatedAt = NOW()
            WHERE createdBy = ${ctx.user.id} 
            AND status IN ('intent_accepted', 'pending_funding')`
      );

      return {
        success: true,
        activatedCount: (pendingOffers as any[]).length,
        activatedOffers: pendingOffers as any[],
        fundingSource: input.fundingSource,
        fundingAmount: input.fundingAmount,
      };
    }),

  // Get projected budget from all active contingency offers
  getProjectedBudget: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const byPosition = await db.execute(
      sql`SELECT positionType, COUNT(*) as count, SUM(annualCompensation) as totalCompensation
          FROM contingency_offers 
          WHERE createdBy = ${ctx.user.id} 
          AND status NOT IN ('expired', 'withdrawn', 'intent_declined')
          GROUP BY positionType`
    );

    const byDepartment = await db.execute(
      sql`SELECT department, COUNT(*) as count, SUM(annualCompensation) as totalCompensation
          FROM contingency_offers 
          WHERE createdBy = ${ctx.user.id} 
          AND status NOT IN ('expired', 'withdrawn', 'intent_declined')
          AND department IS NOT NULL
          GROUP BY department`
    );

    const totals = await db.execute(
      sql`SELECT 
            COUNT(*) as totalOffers,
            SUM(annualCompensation) as totalCompensation,
            AVG(annualCompensation) as avgCompensation
          FROM contingency_offers 
          WHERE createdBy = ${ctx.user.id} 
          AND status NOT IN ('expired', 'withdrawn', 'intent_declined')`
    );

    return {
      byPosition: byPosition as any[],
      byDepartment: byDepartment as any[],
      totals: (totals as any[])[0],
    };
  }),
});
