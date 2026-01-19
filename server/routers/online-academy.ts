import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  onlineCourseDetails,
  curriculumProjects,
  academyInstructors,
  smeContributors,
  facilityPlans,
  accreditationRecords,
} from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const onlineAcademyRouter = router({
  // Course Details
  getCourses: protectedProcedure.query(async () => {
    const db = await getDb();
    return db.select().from(onlineCourseDetails).orderBy(desc(onlineCourseDetails.createdAt));
  }),

  getCourseById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [course] = await db.select().from(onlineCourseDetails).where(eq(onlineCourseDetails.id, input.id));
      if (!course) throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
      return course;
    }),

  createCourse: protectedProcedure
    .input(z.object({
      courseId: z.number(),
      code: z.string().min(1),
      category: z.enum(["financial_sovereignty", "laws_framework", "governance_civics", "entrepreneurship", "creative_enterprise", "core_academic", "professional_development", "simulator_training"]),
      gradeLevel: z.enum(["k_2", "3_5", "6_8", "9_12", "adult", "all_ages"]).default("all_ages"),
      courseType: z.enum(["proprietary", "licensed", "oer", "partnership"]).default("proprietary"),
      deliveryMethod: z.enum(["asynchronous", "synchronous", "hybrid", "self_paced"]).default("asynchronous"),
      creditHours: z.number().optional(),
      duration: z.string().optional(),
      syllabus: z.string().optional(),
      lmsUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const values: any = {
        ...input,
        creditHours: input.creditHours?.toString(),
      };
      const [result] = await db.insert(onlineCourseDetails).values(values);
      return { id: result.insertId, ...input };
    }),

  updateCourse: protectedProcedure
    .input(z.object({
      id: z.number(),
      code: z.string().optional(),
      category: z.enum(["financial_sovereignty", "laws_framework", "governance_civics", "entrepreneurship", "creative_enterprise", "core_academic", "professional_development", "simulator_training"]).optional(),
      gradeLevel: z.enum(["k_2", "3_5", "6_8", "9_12", "adult", "all_ages"]).optional(),
      courseType: z.enum(["proprietary", "licensed", "oer", "partnership"]).optional(),
      deliveryMethod: z.enum(["asynchronous", "synchronous", "hybrid", "self_paced"]).optional(),
      creditHours: z.number().optional(),
      duration: z.string().optional(),
      syllabus: z.string().optional(),
      lmsUrl: z.string().optional(),
      approvedBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const { id, ...updates } = input;
      const values: any = { ...updates };
      if (updates.creditHours !== undefined) values.creditHours = updates.creditHours.toString();
      if (updates.approvedBy !== undefined) values.approvedAt = new Date();
      
      await db.update(onlineCourseDetails).set(values).where(eq(onlineCourseDetails.id, id));
      return { success: true };
    }),

  // Curriculum Projects
  getProjects: protectedProcedure.query(async () => {
    const db = await getDb();
    return db.select().from(curriculumProjects).orderBy(desc(curriculumProjects.createdAt));
  }),

  createProject: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      projectType: z.enum(["course_development", "assessment_design", "instructor_guide", "accreditation_docs", "lms_setup", "full_curriculum"]),
      scope: z.string().optional(),
      deliverables: z.array(z.string()).optional(),
      contractorId: z.number().optional(),
      contractorName: z.string().optional(),
      contractorCompany: z.string().optional(),
      budget: z.number().optional(),
      startDate: z.string().optional(),
      targetEndDate: z.string().optional(),
      status: z.enum(["planning", "contracted", "in_progress", "review", "completed", "cancelled"]).default("planning"),
      grantFunded: z.boolean().default(false),
      grantId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const values: any = {
        ...input,
        budget: input.budget?.toString(),
        deliverables: input.deliverables ? JSON.stringify(input.deliverables) : null,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        targetEndDate: input.targetEndDate ? new Date(input.targetEndDate) : undefined,
      };
      const [result] = await db.insert(curriculumProjects).values(values);
      return { id: result.insertId, ...input };
    }),

  updateProject: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      projectType: z.enum(["course_development", "assessment_design", "instructor_guide", "accreditation_docs", "lms_setup", "full_curriculum"]).optional(),
      scope: z.string().optional(),
      deliverables: z.array(z.string()).optional(),
      contractorId: z.number().optional(),
      contractorName: z.string().optional(),
      contractorCompany: z.string().optional(),
      budget: z.number().optional(),
      amountPaid: z.number().optional(),
      startDate: z.string().optional(),
      targetEndDate: z.string().optional(),
      actualEndDate: z.string().optional(),
      status: z.enum(["planning", "contracted", "in_progress", "review", "completed", "cancelled"]).optional(),
      grantFunded: z.boolean().optional(),
      grantId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const { id, ...updates } = input;
      const values: any = { ...updates };
      if (updates.budget !== undefined) values.budget = updates.budget.toString();
      if (updates.amountPaid !== undefined) values.amountPaid = updates.amountPaid.toString();
      if (updates.deliverables) values.deliverables = JSON.stringify(updates.deliverables);
      if (updates.startDate) values.startDate = new Date(updates.startDate);
      if (updates.targetEndDate) values.targetEndDate = new Date(updates.targetEndDate);
      if (updates.actualEndDate) values.actualEndDate = new Date(updates.actualEndDate);
      
      await db.update(curriculumProjects).set(values).where(eq(curriculumProjects.id, id));
      return { success: true };
    }),

  deleteProject: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.delete(curriculumProjects).where(eq(curriculumProjects.id, input.id));
      return { success: true };
    }),

  // Academy Instructors
  getInstructors: protectedProcedure.query(async () => {
    const db = await getDb();
    return db.select().from(academyInstructors).orderBy(desc(academyInstructors.createdAt));
  }),

  createInstructor: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().optional(),
      phone: z.string().optional(),
      instructorType: z.enum(["credentialed", "sme_guest", "adjunct", "full_time"]).default("adjunct"),
      credentials: z.array(z.object({
        type: z.string(),
        name: z.string(),
        institution: z.string().optional(),
        year: z.number().optional(),
      })).optional(),
      specializations: z.array(z.string()).optional(),
      hourlyRate: z.number().optional(),
      contractStatus: z.enum(["active", "inactive", "pending"]).default("pending"),
      supervisorId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const values: any = {
        ...input,
        hourlyRate: input.hourlyRate?.toString(),
        credentials: input.credentials ? JSON.stringify(input.credentials) : null,
        specializations: input.specializations ? JSON.stringify(input.specializations) : null,
      };
      const [result] = await db.insert(academyInstructors).values(values);
      return { id: result.insertId, ...input };
    }),

  updateInstructor: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      instructorType: z.enum(["credentialed", "sme_guest", "adjunct", "full_time"]).optional(),
      credentials: z.array(z.object({
        type: z.string(),
        name: z.string(),
        institution: z.string().optional(),
        year: z.number().optional(),
      })).optional(),
      specializations: z.array(z.string()).optional(),
      hourlyRate: z.number().optional(),
      contractStatus: z.enum(["active", "inactive", "pending"]).optional(),
      supervisorId: z.number().optional(),
      backgroundCheckDate: z.string().optional(),
      backgroundCheckStatus: z.enum(["pending", "cleared", "expired"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const { id, ...updates } = input;
      const values: any = { ...updates };
      if (updates.hourlyRate !== undefined) values.hourlyRate = updates.hourlyRate.toString();
      if (updates.credentials) values.credentials = JSON.stringify(updates.credentials);
      if (updates.specializations) values.specializations = JSON.stringify(updates.specializations);
      if (updates.backgroundCheckDate) values.backgroundCheckDate = new Date(updates.backgroundCheckDate);
      
      await db.update(academyInstructors).set(values).where(eq(academyInstructors.id, id));
      return { success: true };
    }),

  // SME Contributors (Founding Members as Subject Matter Experts)
  getSMEContributors: protectedProcedure.query(async () => {
    const db = await getDb();
    return db.select().from(smeContributors).orderBy(desc(smeContributors.createdAt));
  }),

  createSMEContributor: protectedProcedure
    .input(z.object({
      familyMemberId: z.number().optional(),
      name: z.string().min(1),
      expertise: z.array(z.string()).optional(),
      entityAffiliation: z.string().optional(),
      contributionTypes: z.array(z.enum(["guest_lecture", "curriculum_review", "content_creation", "mentorship", "assessment_design"])).optional(),
      availability: z.enum(["available", "limited", "unavailable"]).default("available"),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const values: any = {
        ...input,
        expertise: input.expertise ? JSON.stringify(input.expertise) : null,
        contributionTypes: input.contributionTypes ? JSON.stringify(input.contributionTypes) : null,
      };
      const [result] = await db.insert(smeContributors).values(values);
      return { id: result.insertId, ...input };
    }),

  updateSMEContributor: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      expertise: z.array(z.string()).optional(),
      entityAffiliation: z.string().optional(),
      contributionTypes: z.array(z.enum(["guest_lecture", "curriculum_review", "content_creation", "mentorship", "assessment_design"])).optional(),
      availability: z.enum(["available", "limited", "unavailable"]).optional(),
      totalContributions: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const { id, ...updates } = input;
      const values: any = { ...updates };
      if (updates.expertise) values.expertise = JSON.stringify(updates.expertise);
      if (updates.contributionTypes) values.contributionTypes = JSON.stringify(updates.contributionTypes);
      
      await db.update(smeContributors).set(values).where(eq(smeContributors.id, id));
      return { success: true };
    }),

  // Facility Plans
  getFacilityPlans: protectedProcedure.query(async () => {
    const db = await getDb();
    return db.select().from(facilityPlans).orderBy(desc(facilityPlans.createdAt));
  }),

  createFacilityPlan: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      facilityType: z.enum(["education_center", "training_facility", "mixed_use", "satellite"]).default("education_center"),
      description: z.string().optional(),
      plannedCapacity: z.number().optional(),
      estimatedCost: z.number().optional(),
      landRequirements: z.string().optional(),
      buildingRequirements: z.object({
        classrooms: z.number().optional(),
        labs: z.number().optional(),
        offices: z.number().optional(),
        commonAreas: z.number().optional(),
        totalSqFt: z.number().optional(),
      }).optional(),
      status: z.enum(["concept", "planning", "land_search", "land_acquired", "design", "construction", "operational"]).default("concept"),
      targetOpenDate: z.string().optional(),
      linkedLandAcquisitionId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const values: any = {
        ...input,
        estimatedCost: input.estimatedCost?.toString(),
        buildingRequirements: input.buildingRequirements ? JSON.stringify(input.buildingRequirements) : null,
        targetOpenDate: input.targetOpenDate ? new Date(input.targetOpenDate) : undefined,
      };
      const [result] = await db.insert(facilityPlans).values(values);
      return { id: result.insertId, ...input };
    }),

  updateFacilityPlan: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      facilityType: z.enum(["education_center", "training_facility", "mixed_use", "satellite"]).optional(),
      description: z.string().optional(),
      plannedCapacity: z.number().optional(),
      estimatedCost: z.number().optional(),
      landRequirements: z.string().optional(),
      buildingRequirements: z.object({
        classrooms: z.number().optional(),
        labs: z.number().optional(),
        offices: z.number().optional(),
        commonAreas: z.number().optional(),
        totalSqFt: z.number().optional(),
      }).optional(),
      status: z.enum(["concept", "planning", "land_search", "land_acquired", "design", "construction", "operational"]).optional(),
      targetOpenDate: z.string().optional(),
      linkedLandAcquisitionId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const { id, ...updates } = input;
      const values: any = { ...updates };
      if (updates.estimatedCost !== undefined) values.estimatedCost = updates.estimatedCost.toString();
      if (updates.buildingRequirements) values.buildingRequirements = JSON.stringify(updates.buildingRequirements);
      if (updates.targetOpenDate) values.targetOpenDate = new Date(updates.targetOpenDate);
      
      await db.update(facilityPlans).set(values).where(eq(facilityPlans.id, id));
      return { success: true };
    }),

  // Accreditation Records
  getAccreditations: protectedProcedure.query(async () => {
    const db = await getDb();
    return db.select().from(accreditationRecords).orderBy(desc(accreditationRecords.createdAt));
  }),

  createAccreditation: protectedProcedure
    .input(z.object({
      accreditingBody: z.string().min(1),
      accreditationType: z.enum(["regional", "national", "programmatic", "state"]),
      status: z.enum(["researching", "applying", "pending", "accredited", "probation", "revoked"]).default("researching"),
      applicationDate: z.string().optional(),
      grantedDate: z.string().optional(),
      expirationDate: z.string().optional(),
      renewalDate: z.string().optional(),
      requirements: z.array(z.string()).optional(),
      documentsSubmitted: z.array(z.string()).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const values: any = {
        ...input,
        requirements: input.requirements ? JSON.stringify(input.requirements) : null,
        documentsSubmitted: input.documentsSubmitted ? JSON.stringify(input.documentsSubmitted) : null,
        applicationDate: input.applicationDate ? new Date(input.applicationDate) : undefined,
        grantedDate: input.grantedDate ? new Date(input.grantedDate) : undefined,
        expirationDate: input.expirationDate ? new Date(input.expirationDate) : undefined,
        renewalDate: input.renewalDate ? new Date(input.renewalDate) : undefined,
      };
      const [result] = await db.insert(accreditationRecords).values(values);
      return { id: result.insertId, ...input };
    }),

  // Academy Stats
  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    const courses = await db.select().from(onlineCourseDetails);
    const projects = await db.select().from(curriculumProjects);
    const instructors = await db.select().from(academyInstructors);
    const smes = await db.select().from(smeContributors);
    const facilities = await db.select().from(facilityPlans);
    const accreditations = await db.select().from(accreditationRecords);

    const activeProjects = projects.filter(p => ["contracted", "in_progress", "review"].includes(p.status));
    const activeInstructors = instructors.filter(i => i.contractStatus === "active");
    const credentialedInstructors = instructors.filter(i => i.instructorType === "credentialed");
    const availableSMEs = smes.filter(s => s.availability !== "unavailable");
    
    const totalProjectBudget = projects.reduce((sum, p) => sum + parseFloat(p.budget?.toString() || "0"), 0);
    const totalPaid = projects.reduce((sum, p) => sum + parseFloat(p.amountPaid?.toString() || "0"), 0);

    return {
      totalCourses: courses.length,
      coursesByCategory: {
        financial_sovereignty: courses.filter(c => c.category === "financial_sovereignty").length,
        laws_framework: courses.filter(c => c.category === "laws_framework").length,
        governance_civics: courses.filter(c => c.category === "governance_civics").length,
        entrepreneurship: courses.filter(c => c.category === "entrepreneurship").length,
        creative_enterprise: courses.filter(c => c.category === "creative_enterprise").length,
        core_academic: courses.filter(c => c.category === "core_academic").length,
        professional_development: courses.filter(c => c.category === "professional_development").length,
        simulator_training: courses.filter(c => c.category === "simulator_training").length,
      },
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      completedProjects: projects.filter(p => p.status === "completed").length,
      totalProjectBudget,
      totalPaid,
      remainingBudget: totalProjectBudget - totalPaid,
      totalInstructors: instructors.length,
      activeInstructors: activeInstructors.length,
      credentialedInstructors: credentialedInstructors.length,
      totalSMEs: smes.length,
      availableSMEs: availableSMEs.length,
      totalFacilityPlans: facilities.length,
      facilitiesInProgress: facilities.filter(f => !["concept", "operational"].includes(f.status)).length,
      totalAccreditations: accreditations.length,
      activeAccreditations: accreditations.filter(a => a.status === "accredited").length,
    };
  }),

  // Seed default Academy Director (Cornelius)
  seedAcademyDirector: protectedProcedure.mutation(async () => {
    const db = await getDb();
    const existing = await db.select().from(academyInstructors);
    const hasDirector = existing.some(i => i.instructorType === "credentialed" && i.name.includes("Cornelius"));
    
    if (hasDirector) {
      return { message: "Academy Director already exists", success: false };
    }

    const [result] = await db.insert(academyInstructors).values({
      name: "Cornelius (Academy Director)",
      instructorType: "credentialed",
      credentials: JSON.stringify([
        { type: "degree", name: "Master's in Education", institution: "University", year: 2020 }
      ]),
      specializations: JSON.stringify(["Curriculum Development", "Educational Leadership", "Online Learning"]),
      contractStatus: "active",
      notes: "Sole credentialed educator. Academy Director. Founding members contribute as SME guests only - no education degrees required.",
    });

    return { id: result.insertId, message: "Academy Director (Cornelius) added successfully", success: true };
  }),
});
