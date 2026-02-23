import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const trainingTransitionRouter = router({
  // Get all required transition training courses
  getRequiredCourses: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    const courses = await db.execute(
      sql`SELECT * FROM transition_training_requirements ORDER BY sequenceOrder ASC`
    );
    return courses as any[];
  }),

  // Get employee's training progress for transition
  getEmployeeProgress: protectedProcedure
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      // Get all required courses
      const requirements = await db.execute(
        sql`SELECT * FROM transition_training_requirements ORDER BY sequenceOrder ASC`
      );
      
      // Get employee's enrollments
      const enrollments = await db.execute(
        sql`SELECT * FROM training_enrollments WHERE employeeId = ${input.employeeId} AND isTransitionRequirement = TRUE`
      );
      
      // Get employee's completions
      const completions = await db.execute(
        sql`SELECT * FROM training_completions WHERE employeeId = ${input.employeeId} AND passed = TRUE`
      );
      
      const enrollmentMap = new Map((enrollments as any[]).map(e => [e.courseId, e]));
      const completionMap = new Map((completions as any[]).map(c => [c.courseId, c]));
      
      const courseProgress = (requirements as any[]).map(req => ({
        ...req,
        enrollment: enrollmentMap.get(req.courseId) || null,
        completion: completionMap.get(req.courseId) || null,
        status: completionMap.has(req.courseId) 
          ? 'completed' 
          : enrollmentMap.has(req.courseId) 
            ? (enrollmentMap.get(req.courseId)?.status || 'not_started')
            : 'not_enrolled'
      }));
      
      const totalRequired = (requirements as any[]).filter(r => r.isRequired).length;
      const completedRequired = courseProgress.filter(c => c.status === 'completed' && c.isRequired).length;
      const totalHoursRequired = (requirements as any[]).filter(r => r.isRequired).reduce((sum, r) => sum + parseFloat(r.durationHours || 0), 0);
      const hoursCompleted = courseProgress.filter(c => c.status === 'completed').reduce((sum, c) => sum + parseFloat(c.durationHours || 0), 0);
      
      return {
        courses: courseProgress,
        summary: {
          totalRequired,
          completedRequired,
          percentComplete: totalRequired > 0 ? Math.round((completedRequired / totalRequired) * 100) : 0,
          totalHoursRequired,
          hoursCompleted,
          allRequiredComplete: completedRequired >= totalRequired
        }
      };
    }),

  // Enroll employee in all required transition training
  enrollInTransitionTraining: protectedProcedure
    .input(z.object({ 
      employeeId: z.number(),
      transitionId: z.number().optional()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      // Get all required courses
      const requirements = await db.execute(
        sql`SELECT * FROM transition_training_requirements WHERE isRequired = TRUE ORDER BY sequenceOrder ASC`
      );
      
      // Check existing enrollments
      const existing = await db.execute(
        sql`SELECT courseId FROM training_enrollments WHERE employeeId = ${input.employeeId} AND isTransitionRequirement = TRUE`
      );
      
      const existingCourseIds = new Set((existing as any[]).map(e => e.courseId));
      
      // Enroll in courses not already enrolled
      for (const req of (requirements as any[])) {
        if (!existingCourseIds.has(req.courseId)) {
          await db.execute(
            sql`INSERT INTO training_enrollments (employeeId, courseId, courseName, status, isTransitionRequirement, transitionId)
             VALUES (${input.employeeId}, ${req.courseId}, ${req.courseName}, 'not_started', TRUE, ${input.transitionId || null})`
          );
        }
      }
      
      return { 
        success: true, 
        enrolledCount: (requirements as any[]).length - existingCourseIds.size 
      };
    }),

  // Update course progress
  updateProgress: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      courseId: z.string(),
      progress: z.number().min(0).max(100),
      status: z.enum(['not_started', 'in_progress', 'completed', 'failed'])
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      await db.execute(
        sql`UPDATE training_enrollments 
         SET progress = ${input.progress}, status = ${input.status}, updatedAt = NOW()
         WHERE employeeId = ${input.employeeId} AND courseId = ${input.courseId}`
      );
      
      return { success: true };
    }),

  // Record course completion
  recordCompletion: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      courseId: z.string(),
      score: z.number().min(0).max(100)
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      // Get course requirements
      const courses = await db.execute(
        sql`SELECT * FROM transition_training_requirements WHERE courseId = ${input.courseId}`
      );
      const course = (courses as any[])[0];
      
      if (!course) {
        throw new Error('Course not found');
      }
      
      // Get enrollment
      const enrollments = await db.execute(
        sql`SELECT * FROM training_enrollments WHERE employeeId = ${input.employeeId} AND courseId = ${input.courseId}`
      );
      const enrollment = (enrollments as any[])[0];
      
      if (!enrollment) {
        throw new Error('Employee not enrolled in this course');
      }
      
      const passed = input.score >= parseFloat(course.passingScore);
      const certificateNumber = passed 
        ? `CERT-${input.courseId}-${input.employeeId}-${Date.now()}`
        : null;
      
      // Record completion
      await db.execute(
        sql`INSERT INTO training_completions 
         (enrollmentId, employeeId, courseId, courseName, score, passingScore, passed, certificateNumber, hoursCompleted)
         VALUES (${enrollment.id}, ${input.employeeId}, ${input.courseId}, ${course.courseName}, ${input.score}, ${course.passingScore}, ${passed}, ${certificateNumber}, ${course.durationHours})`
      );
      
      // Update enrollment status
      await db.execute(
        sql`UPDATE training_enrollments 
         SET status = ${passed ? 'completed' : 'failed'}, progress = 100, updatedAt = NOW()
         WHERE id = ${enrollment.id}`
      );
      
      return {
        success: true,
        passed,
        score: input.score,
        passingScore: parseFloat(course.passingScore),
        certificateNumber
      };
    }),

  // Check if employee has completed all transition training
  checkTransitionEligibility: protectedProcedure
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      // Get required course count
      const requirements = await db.execute(
        sql`SELECT COUNT(*) as total FROM transition_training_requirements WHERE isRequired = TRUE`
      );
      const totalRequired = (requirements as any[])[0].total;
      
      // Get completed course count
      const completions = await db.execute(
        sql`SELECT COUNT(DISTINCT tc.courseId) as completed
         FROM training_completions tc
         JOIN transition_training_requirements ttr ON tc.courseId = ttr.courseId
         WHERE tc.employeeId = ${input.employeeId} AND tc.passed = TRUE AND ttr.isRequired = TRUE`
      );
      const completedCount = (completions as any[])[0].completed;
      
      // Get incomplete courses
      const incomplete = await db.execute(
        sql`SELECT ttr.courseId, ttr.courseName, ttr.durationHours
         FROM transition_training_requirements ttr
         WHERE ttr.isRequired = TRUE
         AND ttr.courseId NOT IN (
           SELECT tc.courseId FROM training_completions tc 
           WHERE tc.employeeId = ${input.employeeId} AND tc.passed = TRUE
         )`
      );
      
      return {
        eligible: completedCount >= totalRequired,
        totalRequired,
        completedCount,
        remainingCount: totalRequired - completedCount,
        incompleteCourses: incomplete as any[]
      };
    }),

  // Get training statistics
  getTrainingStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    const enrollmentStats = await db.execute(
      sql`SELECT 
         COUNT(DISTINCT employeeId) as totalEmployeesEnrolled,
         COUNT(*) as totalEnrollments,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedEnrollments,
         SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgressEnrollments
       FROM training_enrollments WHERE isTransitionRequirement = TRUE`
    );
    
    const completionStats = await db.execute(
      sql`SELECT 
         COUNT(*) as totalCompletions,
         SUM(hoursCompleted) as totalHoursCompleted,
         AVG(score) as averageScore
       FROM training_completions`
    );
    
    const courseStats = await db.execute(
      sql`SELECT 
         ttr.courseId,
         ttr.courseName,
         COUNT(DISTINCT te.employeeId) as enrolledCount,
         SUM(CASE WHEN tc.passed = TRUE THEN 1 ELSE 0 END) as passedCount,
         AVG(tc.score) as averageScore
       FROM transition_training_requirements ttr
       LEFT JOIN training_enrollments te ON ttr.courseId = te.courseId
       LEFT JOIN training_completions tc ON ttr.courseId = tc.courseId
       GROUP BY ttr.courseId, ttr.courseName
       ORDER BY ttr.sequenceOrder`
    );
    
    return {
      enrollment: (enrollmentStats as any[])[0] || {},
      completion: (completionStats as any[])[0] || {},
      courses: courseStats as any[]
    };
  })
});
