import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";

export const trainingTransitionRouter = router({
  // Get all required transition training courses
  getRequiredCourses: protectedProcedure.query(async () => {
    const db = await getDb();
    const [courses] = await db.execute(
      `SELECT * FROM transition_training_requirements ORDER BY sequenceOrder ASC`
    );
    return courses as any[];
  }),

  // Get employee's training progress for transition
  getEmployeeProgress: protectedProcedure
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      
      // Get all required courses
      const [requirements] = await db.execute(
        `SELECT * FROM transition_training_requirements ORDER BY sequenceOrder ASC`
      );
      
      // Get employee's enrollments
      const [enrollments] = await db.execute(
        `SELECT * FROM training_enrollments WHERE employeeId = ? AND isTransitionRequirement = TRUE`,
        [input.employeeId]
      );
      
      // Get employee's completions
      const [completions] = await db.execute(
        `SELECT * FROM training_completions WHERE employeeId = ? AND passed = TRUE`,
        [input.employeeId]
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
      
      const totalCourses = (requirements as any[]).length;
      const completedCourses = (completions as any[]).length;
      const totalHours = (requirements as any[]).reduce((sum: number, r: any) => sum + parseFloat(r.durationHours), 0);
      const completedHours = courseProgress
        .filter(c => c.status === 'completed')
        .reduce((sum, c) => sum + parseFloat(c.durationHours), 0);
      
      return {
        courses: courseProgress,
        summary: {
          totalCourses,
          completedCourses,
          progressPercent: Math.round((completedCourses / totalCourses) * 100),
          totalHours,
          completedHours,
          hoursRemaining: totalHours - completedHours,
          allCompleted: completedCourses === totalCourses
        }
      };
    }),

  // Enroll employee in all required transition courses
  enrollInTransitionTraining: protectedProcedure
    .input(z.object({ 
      employeeId: z.number(),
      transitionId: z.number().optional()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      // Get all required courses
      const [requirements] = await db.execute(
        `SELECT * FROM transition_training_requirements WHERE isRequired = TRUE ORDER BY sequenceOrder ASC`
      );
      
      // Check existing enrollments
      const [existing] = await db.execute(
        `SELECT courseId FROM training_enrollments WHERE employeeId = ? AND isTransitionRequirement = TRUE`,
        [input.employeeId]
      );
      const existingCourseIds = new Set((existing as any[]).map(e => e.courseId));
      
      // Enroll in courses not already enrolled
      const newEnrollments = [];
      for (const req of requirements as any[]) {
        if (!existingCourseIds.has(req.courseId)) {
          await db.execute(
            `INSERT INTO training_enrollments (employeeId, courseId, courseName, status, isTransitionRequirement, transitionId)
             VALUES (?, ?, ?, 'not_started', TRUE, ?)`,
            [input.employeeId, req.courseId, req.courseName, input.transitionId || null]
          );
          newEnrollments.push(req.courseId);
        }
      }
      
      return {
        success: true,
        newEnrollments,
        message: `Enrolled in ${newEnrollments.length} new courses`
      };
    }),

  // Update course progress
  updateCourseProgress: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      courseId: z.string(),
      progress: z.number().min(0).max(100),
      status: z.enum(['not_started', 'in_progress', 'completed', 'failed'])
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      await db.execute(
        `UPDATE training_enrollments 
         SET progress = ?, status = ?, updatedAt = NOW()
         WHERE employeeId = ? AND courseId = ?`,
        [input.progress, input.status, input.employeeId, input.courseId]
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
      
      // Get course requirements
      const [courses] = await db.execute(
        `SELECT * FROM transition_training_requirements WHERE courseId = ?`,
        [input.courseId]
      );
      const course = (courses as any[])[0];
      
      if (!course) {
        throw new Error('Course not found');
      }
      
      // Get enrollment
      const [enrollments] = await db.execute(
        `SELECT * FROM training_enrollments WHERE employeeId = ? AND courseId = ?`,
        [input.employeeId, input.courseId]
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
        `INSERT INTO training_completions 
         (enrollmentId, employeeId, courseId, courseName, score, passingScore, passed, certificateNumber, hoursCompleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          enrollment.id,
          input.employeeId,
          input.courseId,
          course.courseName,
          input.score,
          course.passingScore,
          passed,
          certificateNumber,
          course.durationHours
        ]
      );
      
      // Update enrollment status
      await db.execute(
        `UPDATE training_enrollments 
         SET status = ?, progress = 100, updatedAt = NOW()
         WHERE id = ?`,
        [passed ? 'completed' : 'failed', enrollment.id]
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
      const [requirements] = await db.execute(
        `SELECT COUNT(*) as total FROM transition_training_requirements WHERE isRequired = TRUE`
      );
      const totalRequired = (requirements as any[])[0].total;
      
      // Get completed course count
      const [completions] = await (db as any).execute(
        `SELECT COUNT(DISTINCT tc.courseId) as completed
         FROM training_completions tc
         JOIN transition_training_requirements ttr ON tc.courseId = ttr.courseId
         WHERE tc.employeeId = ? AND tc.passed = TRUE AND ttr.isRequired = TRUE`,
        [input.employeeId]
      );
      const completedCount = (completions as any[])[0].completed;
      
      // Get incomplete courses
      const [incomplete] = await (db as any).execute(
        `SELECT ttr.* FROM transition_training_requirements ttr
         WHERE ttr.isRequired = TRUE
         AND ttr.courseId NOT IN (
           SELECT courseId FROM training_completions 
           WHERE employeeId = ? AND passed = TRUE
         )
         ORDER BY ttr.sequenceOrder`,
        [input.employeeId]
      );
      
      return {
        eligible: completedCount >= totalRequired,
        totalRequired,
        completedCount,
        remainingCount: totalRequired - completedCount,
        incompleteCourses: incomplete
      };
    }),

  // Get employee's certificates
  getEmployeeCertificates: protectedProcedure
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      const [certificates] = await (db as any).execute(
        `SELECT tc.*, ttr.category, ttr.durationHours
         FROM training_completions tc
         JOIN transition_training_requirements ttr ON tc.courseId = ttr.courseId
         WHERE tc.employeeId = ? AND tc.passed = TRUE
         ORDER BY tc.completionDate DESC`,
        [input.employeeId]
      );
      
      return certificates;
    }),

  // Get training dashboard stats
  getTrainingStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    const [enrollmentStats] = await db.execute(
      `SELECT 
         COUNT(DISTINCT employeeId) as totalEmployeesEnrolled,
         COUNT(*) as totalEnrollments,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedEnrollments,
         SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgressEnrollments
       FROM training_enrollments
       WHERE isTransitionRequirement = TRUE`
    );
    
    const [completionStats] = await db.execute(
      `SELECT 
         COUNT(*) as totalCompletions,
         SUM(hoursCompleted) as totalHoursCompleted,
         AVG(score) as averageScore
       FROM training_completions
       WHERE passed = TRUE`
    );
    
    const [courseStats] = await db.execute(
      `SELECT 
         ttr.courseId,
         ttr.courseName,
         ttr.category,
         COUNT(tc.id) as completionCount,
         AVG(tc.score) as averageScore
       FROM transition_training_requirements ttr
       LEFT JOIN training_completions tc ON ttr.courseId = tc.courseId AND tc.passed = TRUE
       GROUP BY ttr.courseId, ttr.courseName, ttr.category
       ORDER BY ttr.sequenceOrder`
    );
    
    return {
      enrollment: (enrollmentStats as unknown as any[])[0],
      completion: (completionStats as unknown as any[])[0],
      courseBreakdown: courseStats as unknown as any[]
    };
  })
});
