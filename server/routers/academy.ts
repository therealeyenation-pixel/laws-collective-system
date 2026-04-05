/**
 * Luv Learning Academy Router
 * K-12 Sovereign Education System
 * 
 * Houses: Wonder (K-5), Form (6-8), Mastery (9-12)
 * Divine STEM Modules + House of Many Tongues
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb, getCurriculumSubjects, getCoursesBySubject, getStudentEnrollments } from "../db";
import { 
  academyHouses, 
  divineStemModules, 
  academyCourses, 
  academyLanguages,
  studentProfiles,
  studentProgress,
  livingScrolls,
  masteryCertificates,
  blockchainRecords
} from "../../drizzle/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import crypto from "crypto";

export const academyRouter = router({
  // ============================================
  // LEGACY CURRICULUM FUNCTIONS
  // ============================================
  
  getSubjects: protectedProcedure.query(async () => {
    return await getCurriculumSubjects();
  }),

  getCoursesBySubject: protectedProcedure
    .input(z.object({ subjectId: z.number() }))
    .query(async ({ input }) => {
      return await getCoursesBySubject(input.subjectId);
    }),

  getMyEnrollments: protectedProcedure.query(async ({ ctx }) => {
    return await getStudentEnrollments(ctx.user.id);
  }),

  // ============================================
  // ACADEMY HOUSES
  // ============================================
  
  getHouses: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const houses = await db.select().from(academyHouses).orderBy(asc(academyHouses.id));
    return houses;
  }),

  getHouseBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [house] = await db.select().from(academyHouses).where(eq(academyHouses.slug, input.slug));
      return house;
    }),

  // ============================================
  // DIVINE STEM MODULES
  // ============================================
  
  getModules: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const modules = await db.select().from(divineStemModules).orderBy(asc(divineStemModules.orderIndex));
    return modules;
  }),

  getModuleBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [module] = await db.select().from(divineStemModules).where(eq(divineStemModules.slug, input.slug));
      return module;
    }),

  getModulesByCategory: publicProcedure
    .input(z.object({ category: z.enum(["stem", "ceremonial", "entrepreneurial", "creative", "language"]) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const modules = await db.select().from(divineStemModules)
        .where(eq(divineStemModules.category, input.category))
        .orderBy(asc(divineStemModules.orderIndex));
      return modules;
    }),

  // ============================================
  // ACADEMY COURSES
  // ============================================
  
  getAcademyCourses: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const courseList = await db.select().from(academyCourses).where(eq(academyCourses.status, "active"));
    return courseList;
  }),

  getCoursesByHouse: publicProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const courseList = await db.select().from(academyCourses)
        .where(and(eq(academyCourses.houseId, input.houseId), eq(academyCourses.status, "active")));
      return courseList;
    }),

  getCoursesByModule: publicProcedure
    .input(z.object({ moduleId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const courseList = await db.select().from(academyCourses)
        .where(and(eq(academyCourses.moduleId, input.moduleId), eq(academyCourses.status, "active")));
      return courseList;
    }),

  getAcademyCourseById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [course] = await db.select().from(academyCourses).where(eq(academyCourses.id, input.id));
      return course;
    }),

  // ============================================
  // LANGUAGES (House of Many Tongues)
  // ============================================
  
  getLanguages: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const languages = await db.select().from(academyLanguages).where(eq(academyLanguages.status, "active"));
    return languages;
  }),

  getLanguagesByCategory: publicProcedure
    .input(z.object({ category: z.enum(["indigenous", "ancestral_flame", "global_trade"]) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const languages = await db.select().from(academyLanguages)
        .where(and(eq(academyLanguages.category, input.category), eq(academyLanguages.status, "active")));
      return languages;
    }),

  getLanguageBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [language] = await db.select().from(academyLanguages).where(eq(academyLanguages.slug, input.slug));
      return language;
    }),

  // ============================================
  // STUDENT PROFILES
  // ============================================
  
  getStudentProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, ctx.user.id));
    return profile;
  }),

  createStudentProfile: protectedProcedure
    .input(z.object({
      displayName: z.string().optional(),
      gradeLevel: z.string().optional(),
      birthYear: z.number().optional(),
      houseId: z.number().optional(),
      primaryLanguageId: z.number().optional(),
      selectedLanguages: z.array(z.number()).optional(),
      ceremonialPath: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [profile] = await db.insert(studentProfiles).values({
        userId: ctx.user.id,
        displayName: input.displayName,
        gradeLevel: input.gradeLevel,
        birthYear: input.birthYear,
        houseId: input.houseId,
        primaryLanguageId: input.primaryLanguageId,
        selectedLanguages: input.selectedLanguages ? JSON.stringify(input.selectedLanguages) : null,
        ceremonialPath: input.ceremonialPath
      }).$returningId();
      
      return { id: profile.id, message: "Student profile created" };
    }),

  // ============================================
  // STUDENT PROGRESS
  // ============================================
  
  getStudentProgress: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, ctx.user.id));
    if (!profile) return [];
    
    const progress = await db.select().from(studentProgress)
      .where(eq(studentProgress.studentProfileId, profile.id))
      .orderBy(desc(studentProgress.updatedAt));
    return progress;
  }),

  startAcademyCourse: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, ctx.user.id));
      if (!profile) throw new Error("Student profile not found. Please create a profile first.");
      
      const [existing] = await db.select().from(studentProgress)
        .where(and(
          eq(studentProgress.studentProfileId, profile.id),
          eq(studentProgress.courseId, input.courseId)
        ));
      
      if (existing) return { message: "Course already started", progressId: existing.id };
      
      const [progress] = await db.insert(studentProgress).values({
        studentProfileId: profile.id,
        courseId: input.courseId,
        progressType: "course",
        status: "in_progress",
        progressPercentage: 0,
        startedAt: new Date()
      }).$returningId();
      
      return { message: "Course started", progressId: progress.id };
    }),

  // ============================================
  // LIVING SCROLLS
  // ============================================
  
  getLivingScrolls: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, ctx.user.id));
    if (!profile) return [];
    
    const scrolls = await db.select().from(livingScrolls)
      .where(eq(livingScrolls.studentProfileId, profile.id))
      .orderBy(desc(livingScrolls.updatedAt));
    return scrolls;
  }),

  createLivingScroll: protectedProcedure
    .input(z.object({
      scrollType: z.enum(["voice_scroll", "house_lexicon", "translation_book", "mastery_scroll"]),
      title: z.string(),
      languageId: z.number().optional(),
      content: z.any().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, ctx.user.id));
      if (!profile) throw new Error("Student profile not found");
      
      const [scroll] = await db.insert(livingScrolls).values({
        studentProfileId: profile.id,
        scrollType: input.scrollType,
        title: input.title,
        languageId: input.languageId,
        content: input.content ? JSON.stringify(input.content) : null,
        entriesCount: 0
      }).$returningId();
      
      return { id: scroll.id, message: "Living Scroll created" };
    }),

  // ============================================
  // MASTERY CERTIFICATES
  // ============================================
  
  getMasteryCertificates: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, ctx.user.id));
    if (!profile) return [];
    
    const certificates = await db.select().from(masteryCertificates)
      .where(eq(masteryCertificates.studentProfileId, profile.id))
      .orderBy(desc(masteryCertificates.issuedAt));
    return certificates;
  }),

  issueMasteryCertificate: protectedProcedure
    .input(z.object({
      certificateType: z.enum(["course_completion", "house_graduation", "language_mastery", "stem_mastery", "sovereign_diploma"]),
      title: z.string(),
      description: z.string().optional(),
      courseId: z.number().optional(),
      houseId: z.number().optional(),
      languageId: z.number().optional(),
      level: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, ctx.user.id));
      if (!profile) throw new Error("Student profile not found");
      
      const certData = {
        studentProfileId: profile.id,
        certificateType: input.certificateType,
        title: input.title,
        issuedAt: new Date().toISOString(),
        nonce: crypto.randomBytes(16).toString("hex")
      };
      const blockchainHash = crypto.createHash("sha256").update(JSON.stringify(certData)).digest("hex");
      const verificationCode = `LUV-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
      
      const [cert] = await db.insert(masteryCertificates).values({
        studentProfileId: profile.id,
        certificateType: input.certificateType,
        title: input.title,
        description: input.description,
        courseId: input.courseId,
        houseId: input.houseId,
        languageId: input.languageId,
        level: input.level,
        blockchainHash,
        verificationCode,
        metadata: JSON.stringify(certData)
      }).$returningId();
      
      await db.insert(blockchainRecords).values({
        recordType: "certificate",
        referenceId: cert.id,
        blockchainHash,
        data: JSON.stringify({
          certificateType: input.certificateType,
          title: input.title,
          studentProfileId: profile.id,
          verificationCode
        })
      });
      
      return { 
        id: cert.id, 
        verificationCode,
        blockchainHash,
        message: "Mastery Certificate issued and logged to blockchain" 
      };
    }),

  verifyCertificate: publicProcedure
    .input(z.object({ verificationCode: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [cert] = await db.select().from(masteryCertificates)
        .where(eq(masteryCertificates.verificationCode, input.verificationCode));
      
      if (!cert) return { valid: false, message: "Certificate not found" };
      
      return {
        valid: true,
        certificate: {
          title: cert.title,
          certificateType: cert.certificateType,
          issuedAt: cert.issuedAt,
          level: cert.level,
          blockchainHash: cert.blockchainHash
        }
      };
    }),

  // ============================================
  // ACADEMY OVERVIEW
  // ============================================
  
  getAcademyOverview: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const houses = await db.select().from(academyHouses);
    const modules = await db.select().from(divineStemModules);
    const languages = await db.select().from(academyLanguages);
    const courseList = await db.select().from(academyCourses).where(eq(academyCourses.status, "active"));
    
    return {
      houses,
      modules,
      languages,
      courses: courseList,
      stats: {
        totalHouses: houses.length,
        totalModules: modules.length,
        totalLanguages: languages.length,
        totalCourses: courseList.length
      }
    };
  })
});
