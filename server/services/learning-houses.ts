/**
 * Three Learning Houses Service
 * Phase 19.4: House of Wonder (K-5), House of Form (6-8), House of Mastery (9-12)
 */

import { db, getDb } from "../db";
import { eq, and, desc, sql, inArray, gte, lte } from "drizzle-orm";
import {
  academyHouses,
  academyCourses,
  academyLessons,
  divineStemModules,
  studentProfiles,
  studentProgress,
  tokenTransactions,
  luvLedgerAccounts,
} from "../../drizzle/schema";

// House Definitions
export const LEARNING_HOUSES = {
  wonder: {
    name: "House of Wonder",
    slug: "wonder",
    ceremonialName: "The House of Wonder - Where Curiosity Awakens",
    ageRange: "K-5",
    gradeRange: "K-5",
    description: "For our youngest learners (ages 5-10), where curiosity is celebrated and the foundations of knowledge are laid through play, exploration, and discovery.",
    colorTheme: "amber",
    iconEmoji: "✨",
    principles: [
      "Learning through play and exploration",
      "Building foundational skills with joy",
      "Celebrating curiosity and questions",
      "Connecting to nature and community",
      "Developing social-emotional awareness",
    ],
    ceremonialLayers: [
      "Morning Circle of Gratitude",
      "Story Time with Ancestors",
      "Nature Walk Observations",
      "Creative Expression Hour",
      "Closing Blessing",
    ],
  },
  form: {
    name: "House of Form",
    slug: "form",
    ceremonialName: "The House of Form - Where Knowledge Takes Shape",
    ageRange: "6-8",
    gradeRange: "6-8",
    description: "For middle learners (ages 11-14), where abstract concepts become concrete understanding and students begin to see the interconnections of knowledge.",
    colorTheme: "emerald",
    iconEmoji: "🔷",
    principles: [
      "Critical thinking development",
      "Project-based learning",
      "Collaborative problem-solving",
      "Identity and purpose exploration",
      "Community service integration",
    ],
    ceremonialLayers: [
      "Opening Invocation",
      "Knowledge Circle Discussion",
      "Hands-on Workshop",
      "Reflection Journal",
      "Community Connection",
    ],
  },
  mastery: {
    name: "House of Mastery",
    slug: "mastery",
    ceremonialName: "The House of Mastery - Where Purpose Becomes Action",
    ageRange: "9-12",
    gradeRange: "9-12",
    description: "For advanced learners (ages 15-18), where deep expertise is developed and students prepare to become leaders, creators, and change-makers.",
    colorTheme: "purple",
    iconEmoji: "👑",
    principles: [
      "Mastery-based progression",
      "Real-world application",
      "Leadership development",
      "Entrepreneurial thinking",
      "Legacy creation",
    ],
    ceremonialLayers: [
      "Dawn Meditation",
      "Master Class Session",
      "Apprenticeship Work",
      "Mentorship Circle",
      "Evening Reflection",
    ],
  },
};

// Age to House mapping
export function getHouseForAge(age: number): keyof typeof LEARNING_HOUSES | null {
  if (age >= 5 && age <= 10) return "wonder";
  if (age >= 11 && age <= 14) return "form";
  if (age >= 15 && age <= 18) return "mastery";
  return null;
}

// Grade to House mapping
export function getHouseForGrade(grade: string): keyof typeof LEARNING_HOUSES | null {
  const gradeNum = parseInt(grade.replace(/\D/g, ""));
  if (grade.toLowerCase() === "k" || (gradeNum >= 1 && gradeNum <= 5)) return "wonder";
  if (gradeNum >= 6 && gradeNum <= 8) return "form";
  if (gradeNum >= 9 && gradeNum <= 12) return "mastery";
  return null;
}

// Token rewards by house
export const HOUSE_TOKEN_REWARDS = {
  wonder: {
    lesson_complete: 10,
    course_complete: 75,
    module_complete: 150,
    house_graduation: 500,
  },
  form: {
    lesson_complete: 15,
    course_complete: 100,
    module_complete: 200,
    house_graduation: 750,
  },
  mastery: {
    lesson_complete: 20,
    course_complete: 150,
    module_complete: 300,
    house_graduation: 1000,
  },
};

// Divine STEM Modules adapted for each house
export const DIVINE_STEM_BY_HOUSE = {
  wonder: [
    { name: "Wonder Science", ceremonialTitle: "Discovering the World Around Us", category: "stem" },
    { name: "Number Magic", ceremonialTitle: "Playing with Patterns and Shapes", category: "stem" },
    { name: "Story Coding", ceremonialTitle: "Creating with Simple Commands", category: "stem" },
    { name: "Building Dreams", ceremonialTitle: "Making Things with Our Hands", category: "stem" },
    { name: "Garden Friends", ceremonialTitle: "Growing and Caring for Life", category: "stem" },
    { name: "Song & Movement", ceremonialTitle: "Expressing Through Art and Dance", category: "creative" },
    { name: "Little Entrepreneurs", ceremonialTitle: "Sharing and Trading with Friends", category: "entrepreneurial" },
  ],
  form: [
    { name: "Origin Science", ceremonialTitle: "Science of Origin & Observation", category: "stem" },
    { name: "Sacred Geometry", ceremonialTitle: "Mathematics of Sacred Geometry", category: "stem" },
    { name: "Light & Code", ceremonialTitle: "Technology of Light & Code", category: "stem" },
    { name: "Purpose Engineering", ceremonialTitle: "Engineering of Purpose", category: "stem" },
    { name: "Earth Wisdom", ceremonialTitle: "Living Earth & Ancestral Farming", category: "stem" },
    { name: "Spirit Writing", ceremonialTitle: "Spirit Writing & Air Chants", category: "creative" },
    { name: "Entrepreneurial Spark", ceremonialTitle: "Entrepreneurial Flame Ignition", category: "entrepreneurial" },
  ],
  mastery: [
    { name: "Advanced Sciences", ceremonialTitle: "Mastery of Natural Laws", category: "stem" },
    { name: "Higher Mathematics", ceremonialTitle: "Sacred Mathematics & Calculus", category: "stem" },
    { name: "Systems Architecture", ceremonialTitle: "Technology Systems Design", category: "stem" },
    { name: "Innovation Engineering", ceremonialTitle: "Engineering for Impact", category: "stem" },
    { name: "Sustainable Systems", ceremonialTitle: "Regenerative Earth Systems", category: "stem" },
    { name: "Creative Mastery", ceremonialTitle: "Artistic Expression & Legacy", category: "creative" },
    { name: "Business Creation", ceremonialTitle: "Entrepreneurial Mastery", category: "entrepreneurial" },
  ],
};

/**
 * Get all learning houses
 */
export async function getAllHouses() {
  const database = getDb();
  if (!database) {
    // Return static data if database not available
    return {
      success: true,
      houses: Object.entries(LEARNING_HOUSES).map(([key, house]) => ({
        id: key,
        ...house,
      })),
    };
  }

  try {
    const houses = await database
      .select()
      .from(academyHouses)
      .where(eq(academyHouses.status, "active"))
      .orderBy(academyHouses.gradeRange);

    if (houses.length === 0) {
      // Return static data if no houses in database
      return {
        success: true,
        houses: Object.entries(LEARNING_HOUSES).map(([key, house]) => ({
          id: key,
          ...house,
        })),
      };
    }

    return { success: true, houses };
  } catch (error) {
    console.error("[LearningHouses] Error getting houses:", error);
    return {
      success: true,
      houses: Object.entries(LEARNING_HOUSES).map(([key, house]) => ({
        id: key,
        ...house,
      })),
    };
  }
}

/**
 * Get a specific house by slug
 */
export async function getHouseBySlug(slug: string) {
  const houseKey = slug as keyof typeof LEARNING_HOUSES;
  if (LEARNING_HOUSES[houseKey]) {
    return {
      success: true,
      house: {
        id: slug,
        ...LEARNING_HOUSES[houseKey],
        modules: DIVINE_STEM_BY_HOUSE[houseKey],
        tokenRewards: HOUSE_TOKEN_REWARDS[houseKey],
      },
    };
  }

  return { success: false, house: null, message: "House not found" };
}

/**
 * Get courses for a specific house
 */
export async function getHouseCourses(houseId: number) {
  const database = getDb();
  if (!database) {
    return { success: false, courses: [], message: "Database not available" };
  }

  try {
    const courses = await database
      .select()
      .from(academyCourses)
      .where(and(
        eq(academyCourses.houseId, houseId),
        eq(academyCourses.status, "active")
      ))
      .orderBy(academyCourses.level, academyCourses.title);

    return { success: true, courses };
  } catch (error) {
    console.error("[LearningHouses] Error getting courses:", error);
    return { success: false, courses: [], message: "Failed to fetch courses" };
  }
}

/**
 * Get lessons for a specific course
 */
export async function getCourseLessons(courseId: number) {
  const database = getDb();
  if (!database) {
    return { success: false, lessons: [], message: "Database not available" };
  }

  try {
    const lessons = await database
      .select()
      .from(academyLessons)
      .where(and(
        eq(academyLessons.courseId, courseId),
        eq(academyLessons.status, "active")
      ))
      .orderBy(academyLessons.orderIndex);

    return { success: true, lessons };
  } catch (error) {
    console.error("[LearningHouses] Error getting lessons:", error);
    return { success: false, lessons: [], message: "Failed to fetch lessons" };
  }
}

/**
 * Assign a student to a house based on age or grade
 */
export async function assignStudentToHouse(
  studentProfileId: number,
  method: "age" | "grade",
  value: number | string
) {
  const database = getDb();
  if (!database) {
    return { success: false, message: "Database not available" };
  }

  try {
    // Determine house
    let houseSlug: keyof typeof LEARNING_HOUSES | null;
    if (method === "age") {
      houseSlug = getHouseForAge(value as number);
    } else {
      houseSlug = getHouseForGrade(value as string);
    }

    if (!houseSlug) {
      return { success: false, message: "Could not determine appropriate house for given age/grade" };
    }

    // Get house from database
    const house = await database
      .select()
      .from(academyHouses)
      .where(eq(academyHouses.slug, houseSlug))
      .limit(1);

    if (house.length === 0) {
      return { success: false, message: "House not found in database" };
    }

    // Update student profile
    await database
      .update(studentProfiles)
      .set({
        houseId: house[0].id,
        updatedAt: new Date(),
      })
      .where(eq(studentProfiles.id, studentProfileId));

    return {
      success: true,
      house: {
        id: house[0].id,
        name: house[0].name,
        slug: house[0].slug,
        ceremonialName: house[0].ceremonialName,
      },
      message: `Student assigned to ${house[0].name}`,
    };
  } catch (error) {
    console.error("[LearningHouses] Error assigning student:", error);
    return { success: false, message: "Failed to assign student to house" };
  }
}

/**
 * Get student's progress within their house
 */
export async function getStudentHouseProgress(studentProfileId: number) {
  const database = getDb();
  if (!database) {
    return { success: false, progress: null, message: "Database not available" };
  }

  try {
    // Get student profile with house
    const profile = await database
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.id, studentProfileId))
      .limit(1);

    if (profile.length === 0) {
      return { success: false, progress: null, message: "Student profile not found" };
    }

    if (!profile[0].houseId) {
      return { success: false, progress: null, message: "Student not assigned to a house" };
    }

    // Get house details
    const house = await database
      .select()
      .from(academyHouses)
      .where(eq(academyHouses.id, profile[0].houseId))
      .limit(1);

    // Get all courses for this house
    const courses = await database
      .select()
      .from(academyCourses)
      .where(eq(academyCourses.houseId, profile[0].houseId));

    // Get student's course progress
    const courseProgress = await database
      .select()
      .from(studentProgress)
      .where(and(
        eq(studentProgress.studentProfileId, studentProfileId),
        eq(studentProgress.progressType, "course")
      ));

    // Calculate statistics
    const totalCourses = courses.length;
    const completedCourses = courseProgress.filter(p => p.status === "completed").length;
    const inProgressCourses = courseProgress.filter(p => p.status === "in_progress").length;
    const totalTokensEarned = courseProgress.reduce((sum, p) => sum + (p.tokensEarned || 0), 0);

    const overallProgress = totalCourses > 0
      ? Math.round((completedCourses / totalCourses) * 100)
      : 0;

    return {
      success: true,
      progress: {
        house: house[0],
        totalCourses,
        completedCourses,
        inProgressCourses,
        overallProgress,
        totalTokensEarned,
        readyForGraduation: overallProgress >= 90,
      },
    };
  } catch (error) {
    console.error("[LearningHouses] Error getting progress:", error);
    return { success: false, progress: null, message: "Failed to fetch progress" };
  }
}

/**
 * Start a course for a student
 */
export async function startCourse(studentProfileId: number, courseId: number) {
  const database = getDb();
  if (!database) {
    return { success: false, message: "Database not available" };
  }

  try {
    // Check if progress already exists
    const existing = await database
      .select()
      .from(studentProgress)
      .where(and(
        eq(studentProgress.studentProfileId, studentProfileId),
        eq(studentProgress.courseId, courseId)
      ))
      .limit(1);

    if (existing.length > 0) {
      return { success: true, progressId: existing[0].id, message: "Course already started" };
    }

    // Create new progress record
    const result = await database
      .insert(studentProgress)
      .values({
        studentProfileId,
        courseId,
        progressType: "course",
        status: "in_progress",
        progressPercentage: 0,
        startedAt: new Date(),
      })
      .$returningId();

    return { success: true, progressId: result[0].id, message: "Course started" };
  } catch (error) {
    console.error("[LearningHouses] Error starting course:", error);
    return { success: false, message: "Failed to start course" };
  }
}

/**
 * Complete a lesson and update course progress
 */
export async function completeLesson(
  studentProfileId: number,
  lessonId: number,
  score: number
) {
  const database = getDb();
  if (!database) {
    return { success: false, message: "Database not available" };
  }

  try {
    // Get lesson details
    const lesson = await database
      .select()
      .from(academyLessons)
      .where(eq(academyLessons.id, lessonId))
      .limit(1);

    if (lesson.length === 0) {
      return { success: false, message: "Lesson not found" };
    }

    const tokensEarned = lesson[0].tokensReward || 10;

    // Record lesson completion
    await database.insert(studentProgress).values({
      studentProfileId,
      lessonId,
      progressType: "lesson",
      status: "completed",
      progressPercentage: 100,
      score,
      tokensEarned,
      startedAt: new Date(),
      completedAt: new Date(),
    });

    // Update course progress
    const courseId = lesson[0].courseId;
    const allLessons = await database
      .select()
      .from(academyLessons)
      .where(eq(academyLessons.courseId, courseId));

    const completedLessons = await database
      .select()
      .from(studentProgress)
      .leftJoin(academyLessons, eq(studentProgress.lessonId, academyLessons.id))
      .where(and(
        eq(studentProgress.studentProfileId, studentProfileId),
        eq(academyLessons.courseId, courseId),
        eq(studentProgress.status, "completed")
      ));

    const courseProgress = Math.round((completedLessons.length / allLessons.length) * 100);

    // Update course progress record
    await database
      .update(studentProgress)
      .set({
        progressPercentage: courseProgress,
        status: courseProgress >= 100 ? "completed" : "in_progress",
        completedAt: courseProgress >= 100 ? new Date() : undefined,
      })
      .where(and(
        eq(studentProgress.studentProfileId, studentProfileId),
        eq(studentProgress.courseId, courseId)
      ));

    // Award tokens
    const profile = await database
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.id, studentProfileId))
      .limit(1);

    if (profile.length > 0) {
      await awardHouseTokens(profile[0].userId, tokensEarned, `Completed lesson: ${lesson[0].title}`);
    }

    return {
      success: true,
      tokensEarned,
      courseProgress,
      courseCompleted: courseProgress >= 100,
      message: "Lesson completed",
    };
  } catch (error) {
    console.error("[LearningHouses] Error completing lesson:", error);
    return { success: false, message: "Failed to complete lesson" };
  }
}

/**
 * Award tokens for house achievements
 */
async function awardHouseTokens(userId: number, amount: number, description: string) {
  const database = getDb();
  if (!database) return;

  try {
    // Get or create LuvLedger account
    let account = await database
      .select()
      .from(luvLedgerAccounts)
      .where(eq(luvLedgerAccounts.userId, userId))
      .limit(1);

    if (account.length === 0) {
      await database.insert(luvLedgerAccounts).values({
        userId,
        totalTokens: amount,
        lifetimeTokensEarned: amount,
      });
    } else {
      await database
        .update(luvLedgerAccounts)
        .set({
          totalTokens: sql`${luvLedgerAccounts.totalTokens} + ${amount}`,
          lifetimeTokensEarned: sql`${luvLedgerAccounts.lifetimeTokensEarned} + ${amount}`,
        })
        .where(eq(luvLedgerAccounts.userId, userId));
    }

    // Record transaction
    await database.insert(tokenTransactions).values({
      userId,
      amount,
      transactionType: "earned",
      source: "learning_house",
      description,
    });
  } catch (error) {
    console.error("[LearningHouses] Error awarding tokens:", error);
  }
}

/**
 * Graduate a student from their current house
 */
export async function graduateFromHouse(studentProfileId: number) {
  const database = getDb();
  if (!database) {
    return { success: false, message: "Database not available" };
  }

  try {
    // Get student progress
    const progressResult = await getStudentHouseProgress(studentProfileId);
    if (!progressResult.success || !progressResult.progress) {
      return { success: false, message: "Could not verify student progress" };
    }

    if (!progressResult.progress.readyForGraduation) {
      return {
        success: false,
        message: `Student needs ${90 - progressResult.progress.overallProgress}% more progress to graduate`,
      };
    }

    const house = progressResult.progress.house;
    const houseSlug = house.slug as keyof typeof HOUSE_TOKEN_REWARDS;
    const graduationTokens = HOUSE_TOKEN_REWARDS[houseSlug]?.house_graduation || 500;

    // Get student profile
    const profile = await database
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.id, studentProfileId))
      .limit(1);

    if (profile.length > 0) {
      // Award graduation tokens
      await awardHouseTokens(
        profile[0].userId,
        graduationTokens,
        `Graduated from ${house.name}`
      );
    }

    // Determine next house
    let nextHouse = null;
    if (houseSlug === "wonder") {
      nextHouse = await database
        .select()
        .from(academyHouses)
        .where(eq(academyHouses.slug, "form"))
        .limit(1);
    } else if (houseSlug === "form") {
      nextHouse = await database
        .select()
        .from(academyHouses)
        .where(eq(academyHouses.slug, "mastery"))
        .limit(1);
    }

    return {
      success: true,
      graduation: {
        fromHouse: house.name,
        tokensAwarded: graduationTokens,
        nextHouse: nextHouse?.[0]?.name || "Sovereign Graduate",
        isFinalGraduation: houseSlug === "mastery",
      },
      message: `Congratulations! Graduated from ${house.name}`,
    };
  } catch (error) {
    console.error("[LearningHouses] Error graduating student:", error);
    return { success: false, message: "Failed to process graduation" };
  }
}

/**
 * Seed learning houses into database
 */
export async function seedLearningHouses() {
  const database = getDb();
  if (!database) {
    return { success: false, message: "Database not available" };
  }

  try {
    // Check if houses already exist
    const existing = await database.select().from(academyHouses).limit(1);
    if (existing.length > 0) {
      return { success: true, message: "Houses already seeded", count: 0 };
    }

    // Insert houses
    for (const [key, house] of Object.entries(LEARNING_HOUSES)) {
      await database.insert(academyHouses).values({
        name: house.name,
        slug: house.slug,
        ceremonialName: house.ceremonialName,
        description: house.description,
        ageRange: house.ageRange,
        gradeRange: house.gradeRange,
        colorTheme: house.colorTheme,
        status: "active",
      });
    }

    return { success: true, message: "Houses seeded successfully", count: 3 };
  } catch (error) {
    console.error("[LearningHouses] Error seeding houses:", error);
    return { success: false, message: "Failed to seed houses" };
  }
}
