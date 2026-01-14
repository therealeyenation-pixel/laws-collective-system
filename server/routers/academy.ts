import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getCurriculumSubjects, getCoursesBySubject, getStudentEnrollments } from "../db";
import { eq } from "drizzle-orm";
import { curriculumSubjects, courses, studentEnrollments } from "../../drizzle/schema";
import { getDb } from "../db";

export const academyRouter = router({
  // Get all curriculum subjects
  getSubjects: protectedProcedure.query(async () => {
    return await getCurriculumSubjects();
  }),

  // Get courses for a subject
  getCoursesBySubject: protectedProcedure
    .input(z.object({ subjectId: z.number() }))
    .query(async ({ input }) => {
      return await getCoursesBySubject(input.subjectId);
    }),

  // Get user's course enrollments
  getMyEnrollments: protectedProcedure.query(async ({ ctx }) => {
    return await getStudentEnrollments(ctx.user.id);
  }),

  // Create a curriculum subject (admin only)
  createSubject: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        category: z.enum(["traditional", "business", "practical"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can create subjects");
      }

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const result = await db.insert(curriculumSubjects).values({
        name: input.name,
        description: input.description,
        category: input.category,
      });

      return result;
    }),

  // Create a course (admin only)
  createCourse: protectedProcedure
    .input(
      z.object({
        subjectId: z.number(),
        title: z.string().min(1).max(150),
        level: z.enum(["beginner", "intermediate", "advanced"]),
        ageGroup: z.string().optional(),
        description: z.string().optional(),
        instructor: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can create courses");
      }

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const result = await db.insert(courses).values({
        subjectId: input.subjectId,
        title: input.title,
        level: input.level,
        ageGroup: input.ageGroup,
        description: input.description,
        instructor: input.instructor,
        status: "active",
      });

      return result;
    }),

  // Enroll in a course
  enrollCourse: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Check if already enrolled
      const existing = await db
        .select()
        .from(studentEnrollments)
        .where(
          eq(studentEnrollments.userId, ctx.user.id) &&
            eq(studentEnrollments.courseId, input.courseId)
        )
        .limit(1);

      if (existing.length > 0) {
        throw new Error("Already enrolled in this course");
      }

      const result = await db.insert(studentEnrollments).values({
        userId: ctx.user.id,
        courseId: input.courseId,
        status: "enrolled",
      });

      return result;
    }),

  // Update course progress
  updateProgress: protectedProcedure
    .input(
      z.object({
        enrollmentId: z.number(),
        progressPercentage: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Verify user owns this enrollment
      const enrollment = await db
        .select()
        .from(studentEnrollments)
        .where(eq(studentEnrollments.id, input.enrollmentId))
        .limit(1);

      if (enrollment.length === 0 || enrollment[0].userId !== ctx.user.id) {
        throw new Error("Enrollment not found");
      }

      const newStatus =
        input.progressPercentage === 100 ? "completed" : "in_progress";

      const result = await db
        .update(studentEnrollments)
        .set({
          progressPercentage: input.progressPercentage,
          status: newStatus,
          completedAt: newStatus === "completed" ? new Date() : null,
        })
        .where(eq(studentEnrollments.id, input.enrollmentId));

      return result;
    }),

  // Get curriculum overview (admin only)
  getCurriculumOverview: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can view curriculum overview");
    }

    const subjects = await getCurriculumSubjects();
    const subjectsWithCourses = await Promise.all(
      subjects.map(async (subject) => ({
        ...subject,
        courses: await getCoursesBySubject(subject.id),
      }))
    );

    return {
      totalSubjects: subjects.length,
      subjects: subjectsWithCourses,
    };
  }),
});
