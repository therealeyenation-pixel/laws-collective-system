import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { familyResumes, offerPackages, offerPackageDocuments } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

/**
 * Offer Packages Router
 * 
 * Manages family member resumes and offer package generation
 * with demonstrated competency framework support
 */

// Input schemas
const resumeInput = z.object({
  familyMemberId: z.string(),
  fullName: z.string(),
  title: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
  qualificationType: z.enum(["traditional", "demonstrated", "hybrid"]).default("demonstrated"),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string(),
    year: z.string(),
  })).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    year: z.string(),
    active: z.boolean(),
  })).optional(),
  competencyEvidence: z.array(z.object({
    id: z.string(),
    category: z.string(),
    description: z.string(),
    outcome: z.string(),
    timeframe: z.string(),
    verifiable: z.boolean(),
    verificationSource: z.string().optional(),
  })).optional(),
  skills: z.array(z.object({
    skill: z.string(),
    level: z.enum(["foundational", "proficient", "advanced", "expert"]),
    evidence: z.string(),
  })).optional(),
  references: z.array(z.object({
    name: z.string(),
    relationship: z.string(),
    yearsKnown: z.number(),
    contactInfo: z.string(),
    attestation: z.string(),
  })).optional(),
  developmentPlan: z.string().optional(),
  status: z.enum(["draft", "complete", "approved"]).default("draft"),
});

const offerPackageInput = z.object({
  resumeId: z.number(),
  familyMemberId: z.string(),
  fullName: z.string(),
  positionTitle: z.string(),
  department: z.string().optional(),
  entityId: z.string(),
  entityName: z.string(),
  reportsTo: z.string().optional(),
  employmentType: z.enum(["full_time", "part_time", "contractor", "contingent"]).default("contingent"),
  baseSalary: z.number().optional(),
  salaryFrequency: z.enum(["hourly", "weekly", "biweekly", "monthly", "annually"]).default("annually"),
  tokenAllocation: z.number().optional(),
  revenueSharePercent: z.number().optional(),
  benefits: z.object({
    healthInsurance: z.boolean().default(false),
    dentalVision: z.boolean().default(false),
    retirement401k: z.boolean().default(false),
    paidTimeOff: z.number().default(0),
    tokenEconomy: z.boolean().default(true),
    revenueSharing: z.boolean().default(false),
  }).optional(),
  proposedStartDate: z.string().optional(),
  contingencyConditions: z.string().optional(),
});

export const offerPackagesRouter = router({
  // ============ RESUME OPERATIONS ============
  
  // Create or update a resume
  saveResume: publicProcedure
    .input(resumeInput)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Check if resume exists for this family member
      const existing = await db.select()
        .from(familyResumes)
        .where(eq(familyResumes.familyMemberId, input.familyMemberId))
        .limit(1);
      
      if (existing.length > 0) {
        // Update existing resume
        await db.update(familyResumes)
          .set({
            fullName: input.fullName,
            title: input.title,
            email: input.email || null,
            phone: input.phone,
            location: input.location,
            summary: input.summary,
            qualificationType: input.qualificationType,
            education: input.education,
            certifications: input.certifications,
            competencyEvidence: input.competencyEvidence,
            skills: input.skills,
            references: input.references,
            developmentPlan: input.developmentPlan,
            status: input.status,
          })
          .where(eq(familyResumes.id, existing[0].id));
        
        return { id: existing[0].id, updated: true };
      } else {
        // Create new resume
        const result = await db.insert(familyResumes).values({
          familyMemberId: input.familyMemberId,
          fullName: input.fullName,
          title: input.title,
          email: input.email || null,
          phone: input.phone,
          location: input.location,
          summary: input.summary,
          qualificationType: input.qualificationType,
          education: input.education,
          certifications: input.certifications,
          competencyEvidence: input.competencyEvidence,
          skills: input.skills,
          references: input.references,
          developmentPlan: input.developmentPlan,
          status: input.status,
        });
        
        return { id: result[0].insertId, updated: false };
      }
    }),
  
  // Get resume by family member ID
  getResume: publicProcedure
    .input(z.object({ familyMemberId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const resume = await db.select()
        .from(familyResumes)
        .where(eq(familyResumes.familyMemberId, input.familyMemberId))
        .limit(1);
      
      return resume[0] || null;
    }),
  
  // Get resume by ID
  getResumeById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const resume = await db.select()
        .from(familyResumes)
        .where(eq(familyResumes.id, input.id))
        .limit(1);
      
      return resume[0] || null;
    }),
  
  // Get all resumes
  getAllResumes: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];
      
      const resumes = await db.select()
        .from(familyResumes)
        .orderBy(desc(familyResumes.updatedAt));
      
      return resumes;
    }),
  
  // Delete resume
  deleteResume: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.delete(familyResumes)
        .where(eq(familyResumes.id, input.id));
      
      return { success: true };
    }),
  
  // ============ OFFER PACKAGE OPERATIONS ============
  
  // Create offer package (requires resume)
  createOfferPackage: publicProcedure
    .input(offerPackageInput)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Verify resume exists
      const resume = await db.select()
        .from(familyResumes)
        .where(eq(familyResumes.id, input.resumeId))
        .limit(1);
      
      if (!resume[0]) {
        throw new Error("Resume not found. A resume must be created before generating an offer package.");
      }
      
      // Create offer package
      const result = await db.insert(offerPackages).values({
        resumeId: input.resumeId,
        familyMemberId: input.familyMemberId,
        fullName: input.fullName,
        positionTitle: input.positionTitle,
        department: input.department,
        entityId: input.entityId,
        entityName: input.entityName,
        reportsTo: input.reportsTo,
        employmentType: input.employmentType,
        baseSalary: input.baseSalary?.toString(),
        salaryFrequency: input.salaryFrequency,
        tokenAllocation: input.tokenAllocation,
        revenueSharePercent: input.revenueSharePercent?.toString(),
        benefits: input.benefits,
        proposedStartDate: input.proposedStartDate ? new Date(input.proposedStartDate) : null,
        contingencyConditions: input.contingencyConditions,
      });
      
      return { id: result[0].insertId };
    }),
  
  // Get offer package by ID
  getOfferPackage: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const offer = await db.select()
        .from(offerPackages)
        .where(eq(offerPackages.id, input.id))
        .limit(1);
      
      if (!offer[0]) return null;
      
      // Get associated documents
      const documents = await db.select()
        .from(offerPackageDocuments)
        .where(eq(offerPackageDocuments.offerId, input.id));
      
      // Get associated resume
      const resume = await db.select()
        .from(familyResumes)
        .where(eq(familyResumes.id, offer[0].resumeId))
        .limit(1);
      
      return {
        ...offer[0],
        documents,
        resume: resume[0] || null,
      };
    }),
  
  // Get all offer packages
  getAllOfferPackages: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];
      
      const offers = await db.select()
        .from(offerPackages)
        .orderBy(desc(offerPackages.createdAt));
      
      return offers;
    }),
  
  // Get offer packages by family member
  getOfferPackagesByMember: publicProcedure
    .input(z.object({ familyMemberId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const offers = await db.select()
        .from(offerPackages)
        .where(eq(offerPackages.familyMemberId, input.familyMemberId))
        .orderBy(desc(offerPackages.createdAt));
      
      return offers;
    }),
  
  // Update offer package status
  updateOfferStatus: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "pending_review", "approved", "sent", "accepted", "declined", "expired"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const updates: Record<string, unknown> = { status: input.status };
      
      if (input.status === "sent") {
        updates.offerSentAt = new Date();
      } else if (input.status === "accepted") {
        updates.offerAcceptedAt = new Date();
      }
      
      await db.update(offerPackages)
        .set(updates)
        .where(eq(offerPackages.id, input.id));
      
      return { success: true };
    }),
  
  // ============ DOCUMENT OPERATIONS ============
  
  // Add document to offer package
  addDocument: publicProcedure
    .input(z.object({
      offerId: z.number(),
      documentType: z.enum([
        "offer_letter",
        "position_description",
        "compensation_schedule",
        "nda",
        "non_compete",
        "background_check_auth",
        "direct_deposit",
        "w4",
        "w9",
        "i9",
        "token_agreement",
        "policy_acknowledgment",
        "resume"
      ]),
      title: z.string(),
      content: z.string().optional(),
      s3Key: z.string().optional(),
      s3Url: z.string().optional(),
      requiresSignature: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(offerPackageDocuments).values({
        offerId: input.offerId,
        documentType: input.documentType,
        title: input.title,
        content: input.content,
        s3Key: input.s3Key,
        s3Url: input.s3Url,
        requiresSignature: input.requiresSignature,
        status: "generated",
      });
      
      // Update offer package document flags
      const flagMap: Record<string, string> = {
        offer_letter: "offerLetterGenerated",
        position_description: "positionDescGenerated",
        compensation_schedule: "compensationScheduleGenerated",
        nda: "ndaGenerated",
        non_compete: "nonCompeteGenerated",
        background_check_auth: "backgroundCheckAuthGenerated",
        w4: "taxFormsGenerated",
        w9: "taxFormsGenerated",
        token_agreement: "tokenAgreementGenerated",
      };
      
      const flag = flagMap[input.documentType];
      if (flag) {
        await db.update(offerPackages)
          .set({ [flag]: true })
          .where(eq(offerPackages.id, input.offerId));
      }
      
      return { id: result[0].insertId };
    }),
  
  // Get documents for offer package
  getDocuments: publicProcedure
    .input(z.object({ offerId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const documents = await db.select()
        .from(offerPackageDocuments)
        .where(eq(offerPackageDocuments.offerId, input.offerId))
        .orderBy(offerPackageDocuments.createdAt);
      
      return documents;
    }),
  
  // Sign document
  signDocument: publicProcedure
    .input(z.object({
      documentId: z.number(),
      signatureData: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(offerPackageDocuments)
        .set({
          signedAt: new Date(),
          signatureData: input.signatureData,
          status: "signed",
        })
        .where(eq(offerPackageDocuments.id, input.documentId));
      
      return { success: true };
    }),
  
  // Delete offer package
  deleteOfferPackage: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Delete associated documents first
      await db.delete(offerPackageDocuments)
        .where(eq(offerPackageDocuments.offerId, input.id));
      
      // Delete offer package
      await db.delete(offerPackages)
        .where(eq(offerPackages.id, input.id));
      
      return { success: true };
    }),
  
  // ============ STATISTICS ============
  
  getStats: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) {
        return {
          totalResumes: 0,
          completeResumes: 0,
          draftResumes: 0,
          totalOffers: 0,
          pendingOffers: 0,
          approvedOffers: 0,
          acceptedOffers: 0,
          demonstratedCompetency: 0,
          traditionalCredentials: 0,
          hybridQualifications: 0,
        };
      }
      
      const resumes = await db.select().from(familyResumes);
      const offers = await db.select().from(offerPackages);
      
      return {
        totalResumes: resumes.length,
        completeResumes: resumes.filter((r) => r.status === "complete" || r.status === "approved").length,
        draftResumes: resumes.filter((r) => r.status === "draft").length,
        totalOffers: offers.length,
        pendingOffers: offers.filter((o) => o.status === "pending_review").length,
        approvedOffers: offers.filter((o) => o.status === "approved").length,
        acceptedOffers: offers.filter((o) => o.status === "accepted").length,
        demonstratedCompetency: resumes.filter((r) => r.qualificationType === "demonstrated").length,
        traditionalCredentials: resumes.filter((r) => r.qualificationType === "traditional").length,
        hybridQualifications: resumes.filter((r) => r.qualificationType === "hybrid").length,
      };
    }),
});
