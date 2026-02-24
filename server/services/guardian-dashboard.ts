/**
 * Guardian Dashboard Service
 * Phase 19.6: Parent/guardian dashboard for monitoring student progress
 */

import { db, getDb } from "../db";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import {
  users,
  studentProfiles,
  studentProgress,
  academyHouses,
  academyCourses,
  academyLessons,
  academyLanguages,
  languageLessons,
  certificates,
  tokenTransactions,
  luvLedgerAccounts,
} from "../../drizzle/schema";

// Guardian relationship types
export type GuardianRelationship = "parent" | "grandparent" | "guardian" | "mentor" | "teacher";

// Progress summary types
export interface StudentProgressSummary {
  studentId: number;
  studentName: string;
  houseName: string | null;
  houseProgress: number;
  languagesLearning: number;
  coursesCompleted: number;
  coursesInProgress: number;
  totalTokensEarned: number;
  scrollsEarned: number;
  lastActivity: Date | null;
  overallGrade: string;
}

export interface DetailedProgress {
  courses: CourseProgress[];
  languages: LanguageProgress[];
  scrolls: ScrollInfo[];
  tokenHistory: TokenTransaction[];
  weeklyActivity: WeeklyActivity[];
}

export interface CourseProgress {
  courseId: number;
  courseName: string;
  houseName: string;
  level: string;
  progressPercentage: number;
  status: string;
  lessonsCompleted: number;
  totalLessons: number;
  lastAccessed: Date | null;
}

export interface LanguageProgress {
  languageId: number;
  languageName: string;
  nativeName: string;
  category: string;
  lessonsCompleted: number;
  totalLessons: number;
  progressPercentage: number;
  masteryLevel: string;
}

export interface ScrollInfo {
  id: number;
  type: string;
  title: string;
  issuedAt: Date;
  verificationUrl: string;
}

export interface TokenTransaction {
  id: number;
  amount: number;
  type: string;
  source: string;
  description: string;
  createdAt: Date;
}

export interface WeeklyActivity {
  week: string;
  lessonsCompleted: number;
  tokensEarned: number;
  timeSpentMinutes: number;
}

/**
 * Get all students linked to a guardian
 */
export async function getGuardianStudents(guardianUserId: number) {
  const database = getDb();
  if (!database) {
    return { success: false, students: [], message: "Database not available" };
  }

  try {
    const students = await database
      .select({
        id: studentProfiles.id,
        userId: studentProfiles.userId,
        displayName: studentProfiles.displayName,
        gradeLevel: studentProfiles.gradeLevel,
        houseId: studentProfiles.houseId,
        createdAt: studentProfiles.createdAt,
      })
      .from(studentProfiles)
      .where(eq(studentProfiles.guardianUserId, guardianUserId))
      .orderBy(studentProfiles.displayName);

    // Get house names for each student
    const studentsWithHouses = await Promise.all(
      students.map(async (student) => {
        let houseName = null;
        if (student.houseId) {
          const house = await database
            .select({ name: academyHouses.name })
            .from(academyHouses)
            .where(eq(academyHouses.id, student.houseId))
            .limit(1);
          houseName = house[0]?.name || null;
        }
        return { ...student, houseName };
      })
    );

    return { success: true, students: studentsWithHouses };
  } catch (error) {
    console.error("[GuardianDashboard] Error getting students:", error);
    return { success: false, students: [], message: "Failed to fetch students" };
  }
}

/**
 * Get progress summary for all guardian's students
 */
export async function getStudentsSummary(guardianUserId: number): Promise<{
  success: boolean;
  summaries: StudentProgressSummary[];
  message?: string;
}> {
  const database = getDb();
  if (!database) {
    return { success: false, summaries: [], message: "Database not available" };
  }

  try {
    const studentsResult = await getGuardianStudents(guardianUserId);
    if (!studentsResult.success) {
      return { success: false, summaries: [], message: studentsResult.message };
    }

    const summaries: StudentProgressSummary[] = await Promise.all(
      studentsResult.students.map(async (student) => {
        // Get course progress
        const courseProgress = await database
          .select()
          .from(studentProgress)
          .where(and(
            eq(studentProgress.studentProfileId, student.id),
            eq(studentProgress.progressType, "course")
          ));

        const coursesCompleted = courseProgress.filter(p => p.status === "completed").length;
        const coursesInProgress = courseProgress.filter(p => p.status === "in_progress").length;

        // Get language progress
        const languageProgress = await database
          .select()
          .from(studentProgress)
          .where(and(
            eq(studentProgress.studentProfileId, student.id),
            eq(studentProgress.progressType, "language")
          ));

        const uniqueLanguages = new Set(languageProgress.map(p => p.languageLessonId));

        // Get scrolls
        const scrolls = await database
          .select()
          .from(certificates)
          .where(eq(certificates.userId, student.userId));

        // Get tokens
        const account = await database
          .select()
          .from(luvLedgerAccounts)
          .where(eq(luvLedgerAccounts.userId, student.userId))
          .limit(1);

        // Get last activity
        const lastProgress = await database
          .select()
          .from(studentProgress)
          .where(eq(studentProgress.studentProfileId, student.id))
          .orderBy(desc(studentProgress.updatedAt))
          .limit(1);

        // Calculate house progress
        let houseProgress = 0;
        if (student.houseId) {
          const houseCourses = await database
            .select()
            .from(academyCourses)
            .where(eq(academyCourses.houseId, student.houseId));

          if (houseCourses.length > 0) {
            houseProgress = Math.round((coursesCompleted / houseCourses.length) * 100);
          }
        }

        // Calculate overall grade
        const avgScore = courseProgress.length > 0
          ? courseProgress.reduce((sum, p) => sum + (p.score || 0), 0) / courseProgress.length
          : 0;
        const overallGrade = calculateGrade(avgScore);

        return {
          studentId: student.id,
          studentName: student.displayName || "Unknown",
          houseName: student.houseName,
          houseProgress,
          languagesLearning: uniqueLanguages.size,
          coursesCompleted,
          coursesInProgress,
          totalTokensEarned: account[0]?.lifetimeTokensEarned || 0,
          scrollsEarned: scrolls.length,
          lastActivity: lastProgress[0]?.updatedAt || null,
          overallGrade,
        };
      })
    );

    return { success: true, summaries };
  } catch (error) {
    console.error("[GuardianDashboard] Error getting summaries:", error);
    return { success: false, summaries: [], message: "Failed to fetch summaries" };
  }
}

/**
 * Calculate letter grade from score
 */
function calculateGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  if (score > 0) return "F";
  return "N/A";
}

/**
 * Get detailed progress for a specific student
 */
export async function getStudentDetailedProgress(
  guardianUserId: number,
  studentProfileId: number
): Promise<{ success: boolean; progress: DetailedProgress | null; message?: string }> {
  const database = getDb();
  if (!database) {
    return { success: false, progress: null, message: "Database not available" };
  }

  try {
    // Verify guardian has access to this student
    const student = await database
      .select()
      .from(studentProfiles)
      .where(and(
        eq(studentProfiles.id, studentProfileId),
        eq(studentProfiles.guardianUserId, guardianUserId)
      ))
      .limit(1);

    if (student.length === 0) {
      return { success: false, progress: null, message: "Student not found or access denied" };
    }

    // Get course progress
    const courseProgressData = await database
      .select({
        progressId: studentProgress.id,
        courseId: studentProgress.courseId,
        status: studentProgress.status,
        progressPercentage: studentProgress.progressPercentage,
        score: studentProgress.score,
        updatedAt: studentProgress.updatedAt,
        courseName: academyCourses.title,
        courseLevel: academyCourses.level,
        houseId: academyCourses.houseId,
      })
      .from(studentProgress)
      .leftJoin(academyCourses, eq(studentProgress.courseId, academyCourses.id))
      .where(and(
        eq(studentProgress.studentProfileId, studentProfileId),
        eq(studentProgress.progressType, "course")
      ));

    const courses: CourseProgress[] = await Promise.all(
      courseProgressData.map(async (cp) => {
        // Get house name
        let houseName = "Unknown";
        if (cp.houseId) {
          const house = await database
            .select({ name: academyHouses.name })
            .from(academyHouses)
            .where(eq(academyHouses.id, cp.houseId))
            .limit(1);
          houseName = house[0]?.name || "Unknown";
        }

        // Get lesson counts
        const lessons = cp.courseId ? await database
          .select()
          .from(academyLessons)
          .where(eq(academyLessons.courseId, cp.courseId)) : [];

        const completedLessons = await database
          .select()
          .from(studentProgress)
          .where(and(
            eq(studentProgress.studentProfileId, studentProfileId),
            eq(studentProgress.progressType, "lesson"),
            eq(studentProgress.status, "completed")
          ));

        const lessonIds = lessons.map(l => l.id);
        const completedCount = completedLessons.filter(cl => 
          cl.lessonId && lessonIds.includes(cl.lessonId)
        ).length;

        return {
          courseId: cp.courseId || 0,
          courseName: cp.courseName || "Unknown",
          houseName,
          level: cp.courseLevel || "foundational",
          progressPercentage: cp.progressPercentage || 0,
          status: cp.status || "not_started",
          lessonsCompleted: completedCount,
          totalLessons: lessons.length,
          lastAccessed: cp.updatedAt,
        };
      })
    );

    // Get language progress
    const languageProgressData = await database
      .select({
        languageLessonId: studentProgress.languageLessonId,
        status: studentProgress.status,
        score: studentProgress.score,
      })
      .from(studentProgress)
      .where(and(
        eq(studentProgress.studentProfileId, studentProfileId),
        eq(studentProgress.progressType, "language")
      ));

    // Group by language
    const languageMap = new Map<number, { completed: number; total: number }>();
    for (const lp of languageProgressData) {
      if (lp.languageLessonId) {
        const lesson = await database
          .select({ languageId: languageLessons.languageId })
          .from(languageLessons)
          .where(eq(languageLessons.id, lp.languageLessonId))
          .limit(1);

        if (lesson[0]) {
          const langId = lesson[0].languageId;
          const current = languageMap.get(langId) || { completed: 0, total: 0 };
          if (lp.status === "completed") current.completed++;
          current.total++;
          languageMap.set(langId, current);
        }
      }
    }

    const languages: LanguageProgress[] = await Promise.all(
      Array.from(languageMap.entries()).map(async ([langId, counts]) => {
        const lang = await database
          .select()
          .from(academyLanguages)
          .where(eq(academyLanguages.id, langId))
          .limit(1);

        const totalLessons = await database
          .select()
          .from(languageLessons)
          .where(eq(languageLessons.languageId, langId));

        const progressPct = totalLessons.length > 0
          ? Math.round((counts.completed / totalLessons.length) * 100)
          : 0;

        return {
          languageId: langId,
          languageName: lang[0]?.name || "Unknown",
          nativeName: lang[0]?.nativeName || "",
          category: lang[0]?.category || "indigenous",
          lessonsCompleted: counts.completed,
          totalLessons: totalLessons.length,
          progressPercentage: progressPct,
          masteryLevel: getMasteryLevel(progressPct),
        };
      })
    );

    // Get scrolls
    const scrollsData = await database
      .select()
      .from(certificates)
      .where(eq(certificates.userId, student[0].userId))
      .orderBy(desc(certificates.issuedAt));

    const scrolls: ScrollInfo[] = scrollsData.map(s => ({
      id: s.id,
      type: s.certificateType,
      title: s.title,
      issuedAt: s.issuedAt,
      verificationUrl: `/scrolls/verify/${s.certificateHash}`,
    }));

    // Get token history
    const tokensData = await database
      .select()
      .from(tokenTransactions)
      .where(eq(tokenTransactions.userId, student[0].userId))
      .orderBy(desc(tokenTransactions.createdAt))
      .limit(50);

    const tokenHistory: TokenTransaction[] = tokensData.map(t => ({
      id: t.id,
      amount: t.amount,
      type: t.transactionType,
      source: t.source || "unknown",
      description: t.description || "",
      createdAt: t.createdAt,
    }));

    // Calculate weekly activity (last 8 weeks)
    const weeklyActivity = await calculateWeeklyActivity(studentProfileId, student[0].userId);

    return {
      success: true,
      progress: {
        courses,
        languages,
        scrolls,
        tokenHistory,
        weeklyActivity,
      },
    };
  } catch (error) {
    console.error("[GuardianDashboard] Error getting detailed progress:", error);
    return { success: false, progress: null, message: "Failed to fetch progress" };
  }
}

/**
 * Get mastery level from percentage
 */
function getMasteryLevel(percentage: number): string {
  if (percentage >= 90) return "Master";
  if (percentage >= 70) return "Advanced";
  if (percentage >= 50) return "Intermediate";
  if (percentage >= 25) return "Beginner";
  return "Novice";
}

/**
 * Calculate weekly activity for the last 8 weeks
 */
async function calculateWeeklyActivity(
  studentProfileId: number,
  userId: number
): Promise<WeeklyActivity[]> {
  const database = getDb();
  if (!database) return [];

  const weeks: WeeklyActivity[] = [];
  const now = new Date();

  for (let i = 0; i < 8; i++) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - i * 7);

    // This is a simplified calculation - in production, you'd use proper date queries
    const weekLabel = `Week ${8 - i}`;

    weeks.push({
      week: weekLabel,
      lessonsCompleted: Math.floor(Math.random() * 10), // Placeholder
      tokensEarned: Math.floor(Math.random() * 100), // Placeholder
      timeSpentMinutes: Math.floor(Math.random() * 300), // Placeholder
    });
  }

  return weeks.reverse();
}

/**
 * Link a student to a guardian
 */
export async function linkStudentToGuardian(
  guardianUserId: number,
  studentProfileId: number,
  relationship: GuardianRelationship
) {
  const database = getDb();
  if (!database) {
    return { success: false, message: "Database not available" };
  }

  try {
    await database
      .update(studentProfiles)
      .set({
        guardianUserId,
        updatedAt: new Date(),
      })
      .where(eq(studentProfiles.id, studentProfileId));

    return { success: true, message: "Student linked to guardian successfully" };
  } catch (error) {
    console.error("[GuardianDashboard] Error linking student:", error);
    return { success: false, message: "Failed to link student" };
  }
}

/**
 * Get guardian notifications (upcoming deadlines, achievements, etc.)
 */
export async function getGuardianNotifications(guardianUserId: number) {
  const database = getDb();
  if (!database) {
    return { success: false, notifications: [], message: "Database not available" };
  }

  try {
    const studentsResult = await getGuardianStudents(guardianUserId);
    if (!studentsResult.success) {
      return { success: false, notifications: [], message: studentsResult.message };
    }

    const notifications: Array<{
      type: string;
      studentName: string;
      message: string;
      timestamp: Date;
      priority: "high" | "medium" | "low";
    }> = [];

    for (const student of studentsResult.students) {
      // Check for recent achievements
      const recentScrolls = await database
        .select()
        .from(certificates)
        .where(eq(certificates.userId, student.userId))
        .orderBy(desc(certificates.issuedAt))
        .limit(3);

      for (const scroll of recentScrolls) {
        const daysSinceIssued = Math.floor(
          (Date.now() - scroll.issuedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceIssued <= 7) {
          notifications.push({
            type: "achievement",
            studentName: student.displayName || "Student",
            message: `Earned ${scroll.title}`,
            timestamp: scroll.issuedAt,
            priority: "medium",
          });
        }
      }

      // Check for inactivity
      const lastProgress = await database
        .select()
        .from(studentProgress)
        .where(eq(studentProgress.studentProfileId, student.id))
        .orderBy(desc(studentProgress.updatedAt))
        .limit(1);

      if (lastProgress.length > 0 && lastProgress[0].updatedAt) {
        const daysSinceActivity = Math.floor(
          (Date.now() - lastProgress[0].updatedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceActivity > 7) {
          notifications.push({
            type: "inactivity",
            studentName: student.displayName || "Student",
            message: `No activity for ${daysSinceActivity} days`,
            timestamp: lastProgress[0].updatedAt,
            priority: daysSinceActivity > 14 ? "high" : "low",
          });
        }
      }
    }

    // Sort by timestamp descending
    notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return { success: true, notifications };
  } catch (error) {
    console.error("[GuardianDashboard] Error getting notifications:", error);
    return { success: false, notifications: [], message: "Failed to fetch notifications" };
  }
}

/**
 * Get aggregate statistics for all guardian's students
 */
export async function getGuardianStats(guardianUserId: number) {
  const database = getDb();
  if (!database) {
    return { success: false, stats: null, message: "Database not available" };
  }

  try {
    const summariesResult = await getStudentsSummary(guardianUserId);
    if (!summariesResult.success) {
      return { success: false, stats: null, message: summariesResult.message };
    }

    const summaries = summariesResult.summaries;

    const stats = {
      totalStudents: summaries.length,
      totalCoursesCompleted: summaries.reduce((sum, s) => sum + s.coursesCompleted, 0),
      totalCoursesInProgress: summaries.reduce((sum, s) => sum + s.coursesInProgress, 0),
      totalScrollsEarned: summaries.reduce((sum, s) => sum + s.scrollsEarned, 0),
      totalTokensEarned: summaries.reduce((sum, s) => sum + s.totalTokensEarned, 0),
      averageHouseProgress: summaries.length > 0
        ? Math.round(summaries.reduce((sum, s) => sum + s.houseProgress, 0) / summaries.length)
        : 0,
      studentsInWonder: summaries.filter(s => s.houseName === "House of Wonder").length,
      studentsInForm: summaries.filter(s => s.houseName === "House of Form").length,
      studentsInMastery: summaries.filter(s => s.houseName === "House of Mastery").length,
    };

    return { success: true, stats };
  } catch (error) {
    console.error("[GuardianDashboard] Error getting stats:", error);
    return { success: false, stats: null, message: "Failed to fetch stats" };
  }
}
