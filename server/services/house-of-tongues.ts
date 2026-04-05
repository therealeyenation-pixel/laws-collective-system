/**
 * House of Many Tongues - Language Learning Service
 * Phase 19.3: Language learning module with Indigenous, Ancestral, and Global Trade Tongues
 */

import { db, getDb } from "../db";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import {
  academyLanguages,
  languageLessons,
  studentProfiles,
  studentProgress,
  tokenTransactions,
  luvLedgerAccounts,
} from "../../drizzle/schema";

// Language Categories
export type LanguageCategory = "indigenous" | "ancestral_flame" | "global_trade";

// Lesson Types
export type LessonType = "vocabulary" | "pronunciation" | "conversation" | "ceremony" | "story" | "chant";

// Language definitions by category
export const INDIGENOUS_TONGUES = [
  { name: "Nahuatl", nativeName: "Nāhuatl", slug: "nahuatl", iconEmoji: "🦅", culturalContext: "Language of the Aztec Empire, still spoken by over 1.7 million people in Mexico" },
  { name: "Yoruba", nativeName: "Èdè Yorùbá", slug: "yoruba", iconEmoji: "🌍", culturalContext: "West African language spoken by over 40 million people, rich in proverbs and oral tradition" },
  { name: "Lakota", nativeName: "Lakȟótiyapi", slug: "lakota", iconEmoji: "🦬", culturalContext: "Language of the Lakota people of the Great Plains, carriers of sacred wisdom" },
  { name: "Cherokee", nativeName: "ᏣᎳᎩ ᎦᏬᏂᎯᏍᏗ", slug: "cherokee", iconEmoji: "🍂", culturalContext: "Language with unique syllabary, spoken by the Cherokee Nation" },
  { name: "Quechua", nativeName: "Runasimi", slug: "quechua", iconEmoji: "🏔️", culturalContext: "Language of the Inca Empire, still spoken by millions in the Andes" },
  { name: "Māori", nativeName: "Te Reo Māori", slug: "maori", iconEmoji: "🥝", culturalContext: "Indigenous language of New Zealand, experiencing revitalization" },
];

export const ANCESTRAL_FLAME_TONGUES = [
  { name: "Hebrew", nativeName: "עברית", slug: "hebrew", iconEmoji: "✡️", culturalContext: "Ancient sacred language revived as modern Israeli Hebrew" },
  { name: "Aramaic", nativeName: "ܐܪܡܝܐ", slug: "aramaic", iconEmoji: "📜", culturalContext: "Language of ancient wisdom texts and sacred scriptures" },
  { name: "Ge'ez", nativeName: "ግዕዝ", slug: "geez", iconEmoji: "⛪", culturalContext: "Ancient Ethiopian liturgical language, script of sacred texts" },
  { name: "Sanskrit", nativeName: "संस्कृतम्", slug: "sanskrit", iconEmoji: "🕉️", culturalContext: "Classical language of ancient India, foundation of many modern languages" },
  { name: "Classical Arabic", nativeName: "العربية الفصحى", slug: "classical-arabic", iconEmoji: "☪️", culturalContext: "Language of the Quran and classical Islamic scholarship" },
];

export const GLOBAL_TRADE_TONGUES = [
  { name: "Spanish", nativeName: "Español", slug: "spanish", iconEmoji: "🇪🇸", culturalContext: "Second most spoken native language globally, key to Latin American commerce" },
  { name: "French", nativeName: "Français", slug: "french", iconEmoji: "🇫🇷", culturalContext: "Language of diplomacy, spoken across Africa, Europe, and the Americas" },
  { name: "Swahili", nativeName: "Kiswahili", slug: "swahili", iconEmoji: "🌴", culturalContext: "Lingua franca of East Africa, connecting diverse communities" },
  { name: "Mandarin Chinese", nativeName: "普通话", slug: "mandarin", iconEmoji: "🇨🇳", culturalContext: "Most spoken language globally, essential for global trade" },
  { name: "Portuguese", nativeName: "Português", slug: "portuguese", iconEmoji: "🇧🇷", culturalContext: "Language of Brazil and Portuguese-speaking Africa" },
  { name: "Japanese", nativeName: "日本語", slug: "japanese", iconEmoji: "🇯🇵", culturalContext: "Language of innovation and technology, rich cultural heritage" },
];

// All languages combined
export const ALL_LANGUAGES = [
  ...INDIGENOUS_TONGUES.map(l => ({ ...l, category: "indigenous" as LanguageCategory })),
  ...ANCESTRAL_FLAME_TONGUES.map(l => ({ ...l, category: "ancestral_flame" as LanguageCategory })),
  ...GLOBAL_TRADE_TONGUES.map(l => ({ ...l, category: "global_trade" as LanguageCategory })),
];

// Token rewards for language learning
export const LANGUAGE_TOKEN_REWARDS = {
  lesson_complete: 15,
  vocabulary_mastery: 25,
  pronunciation_achievement: 30,
  conversation_practice: 20,
  ceremony_participation: 50,
  story_completion: 35,
  chant_mastery: 40,
  level_completion: 100,
  language_mastery: 500,
};

/**
 * Get all available languages
 */
export async function getAllLanguages() {
  const database = getDb();
  if (!database) {
    return { success: false, languages: [], message: "Database not available" };
  }

  try {
    const languages = await database
      .select()
      .from(academyLanguages)
      .where(eq(academyLanguages.status, "active"))
      .orderBy(academyLanguages.category, academyLanguages.name);

    return { success: true, languages };
  } catch (error) {
    console.error("[HouseOfTongues] Error getting languages:", error);
    return { success: false, languages: [], message: "Failed to fetch languages" };
  }
}

/**
 * Get languages by category
 */
export async function getLanguagesByCategory(category: LanguageCategory) {
  const database = getDb();
  if (!database) {
    return { success: false, languages: [], message: "Database not available" };
  }

  try {
    const languages = await database
      .select()
      .from(academyLanguages)
      .where(and(
        eq(academyLanguages.category, category),
        eq(academyLanguages.status, "active")
      ))
      .orderBy(academyLanguages.name);

    return { success: true, languages, category };
  } catch (error) {
    console.error("[HouseOfTongues] Error getting languages by category:", error);
    return { success: false, languages: [], message: "Failed to fetch languages" };
  }
}

/**
 * Get lessons for a specific language
 */
export async function getLanguageLessons(languageId: number, level?: string) {
  const database = getDb();
  if (!database) {
    return { success: false, lessons: [], message: "Database not available" };
  }

  try {
    let query = database
      .select()
      .from(languageLessons)
      .where(
        level
          ? and(eq(languageLessons.languageId, languageId), eq(languageLessons.level, level as any), eq(languageLessons.status, "active"))
          : and(eq(languageLessons.languageId, languageId), eq(languageLessons.status, "active"))
      )
      .orderBy(languageLessons.level, languageLessons.orderIndex);

    const lessons = await query;

    return { success: true, lessons, languageId };
  } catch (error) {
    console.error("[HouseOfTongues] Error getting lessons:", error);
    return { success: false, lessons: [], message: "Failed to fetch lessons" };
  }
}

/**
 * Start a language lesson
 */
export async function startLesson(studentProfileId: number, languageLessonId: number) {
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
        eq(studentProgress.languageLessonId, languageLessonId)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update existing progress
      await database
        .update(studentProgress)
        .set({
          status: "in_progress",
          startedAt: new Date(),
        })
        .where(eq(studentProgress.id, existing[0].id));

      return { success: true, progressId: existing[0].id, message: "Lesson resumed" };
    }

    // Create new progress record
    const result = await database
      .insert(studentProgress)
      .values({
        studentProfileId,
        languageLessonId,
        progressType: "language",
        status: "in_progress",
        progressPercentage: 0,
        startedAt: new Date(),
      })
      .$returningId();

    return { success: true, progressId: result[0].id, message: "Lesson started" };
  } catch (error) {
    console.error("[HouseOfTongues] Error starting lesson:", error);
    return { success: false, message: "Failed to start lesson" };
  }
}

/**
 * Complete a language lesson and award tokens
 */
export async function completeLesson(
  studentProfileId: number,
  languageLessonId: number,
  score: number
) {
  const database = getDb();
  if (!database) {
    return { success: false, message: "Database not available" };
  }

  try {
    // Get the lesson to determine token reward
    const lesson = await database
      .select()
      .from(languageLessons)
      .where(eq(languageLessons.id, languageLessonId))
      .limit(1);

    if (lesson.length === 0) {
      return { success: false, message: "Lesson not found" };
    }

    const baseTokens = lesson[0].tokensReward || LANGUAGE_TOKEN_REWARDS.lesson_complete;
    
    // Bonus tokens based on score
    let bonusMultiplier = 1;
    if (score >= 90) bonusMultiplier = 1.5;
    else if (score >= 80) bonusMultiplier = 1.25;
    else if (score >= 70) bonusMultiplier = 1.1;

    const tokensEarned = Math.floor(baseTokens * bonusMultiplier);

    // Update progress
    await database
      .update(studentProgress)
      .set({
        status: score >= 70 ? "completed" : "in_progress",
        progressPercentage: 100,
        score,
        tokensEarned,
        completedAt: new Date(),
      })
      .where(and(
        eq(studentProgress.studentProfileId, studentProfileId),
        eq(studentProgress.languageLessonId, languageLessonId)
      ));

    // Get student profile to find user ID
    const profile = await database
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.id, studentProfileId))
      .limit(1);

    if (profile.length > 0 && score >= 70) {
      // Award tokens to user's LuvLedger account
      await awardLanguageTokens(profile[0].userId, tokensEarned, `Completed ${lesson[0].title}`);
    }

    return {
      success: true,
      tokensEarned,
      score,
      passed: score >= 70,
      message: score >= 70 ? "Lesson completed successfully!" : "Keep practicing!",
    };
  } catch (error) {
    console.error("[HouseOfTongues] Error completing lesson:", error);
    return { success: false, message: "Failed to complete lesson" };
  }
}

/**
 * Award tokens for language learning achievements
 */
async function awardLanguageTokens(userId: number, amount: number, description: string) {
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
      // Create account
      await database.insert(luvLedgerAccounts).values({
        userId,
        totalTokens: amount,
        lifetimeTokensEarned: amount,
      });
    } else {
      // Update account
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
      source: "house_of_tongues",
      description,
    });
  } catch (error) {
    console.error("[HouseOfTongues] Error awarding tokens:", error);
  }
}

/**
 * Get student's language learning progress
 */
export async function getStudentLanguageProgress(studentProfileId: number) {
  const database = getDb();
  if (!database) {
    return { success: false, progress: [], message: "Database not available" };
  }

  try {
    const progress = await database
      .select({
        id: studentProgress.id,
        languageLessonId: studentProgress.languageLessonId,
        status: studentProgress.status,
        progressPercentage: studentProgress.progressPercentage,
        score: studentProgress.score,
        tokensEarned: studentProgress.tokensEarned,
        startedAt: studentProgress.startedAt,
        completedAt: studentProgress.completedAt,
        lessonTitle: languageLessons.title,
        lessonLevel: languageLessons.level,
        lessonType: languageLessons.lessonType,
        languageId: languageLessons.languageId,
      })
      .from(studentProgress)
      .leftJoin(languageLessons, eq(studentProgress.languageLessonId, languageLessons.id))
      .where(and(
        eq(studentProgress.studentProfileId, studentProfileId),
        eq(studentProgress.progressType, "language")
      ))
      .orderBy(desc(studentProgress.startedAt));

    return { success: true, progress };
  } catch (error) {
    console.error("[HouseOfTongues] Error getting progress:", error);
    return { success: false, progress: [], message: "Failed to fetch progress" };
  }
}

/**
 * Get language mastery statistics for a student
 */
export async function getLanguageMasteryStats(studentProfileId: number, languageId: number) {
  const database = getDb();
  if (!database) {
    return { success: false, stats: null, message: "Database not available" };
  }

  try {
    // Get all lessons for this language
    const allLessons = await database
      .select()
      .from(languageLessons)
      .where(eq(languageLessons.languageId, languageId));

    // Get completed lessons
    const completedProgress = await database
      .select()
      .from(studentProgress)
      .leftJoin(languageLessons, eq(studentProgress.languageLessonId, languageLessons.id))
      .where(and(
        eq(studentProgress.studentProfileId, studentProfileId),
        eq(languageLessons.languageId, languageId),
        eq(studentProgress.status, "completed")
      ));

    const totalLessons = allLessons.length;
    const completedLessons = completedProgress.length;
    const masteryPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    // Calculate total tokens earned for this language
    const totalTokens = completedProgress.reduce((sum, p) => sum + (p.student_progress.tokensEarned || 0), 0);

    // Calculate average score
    const scores = completedProgress.map(p => p.student_progress.score).filter(s => s !== null) as number[];
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    // Determine mastery level
    let masteryLevel = "Novice";
    if (masteryPercentage >= 90) masteryLevel = "Master";
    else if (masteryPercentage >= 70) masteryLevel = "Advanced";
    else if (masteryPercentage >= 50) masteryLevel = "Intermediate";
    else if (masteryPercentage >= 25) masteryLevel = "Beginner";

    return {
      success: true,
      stats: {
        languageId,
        totalLessons,
        completedLessons,
        masteryPercentage,
        masteryLevel,
        totalTokensEarned: totalTokens,
        averageScore,
      },
    };
  } catch (error) {
    console.error("[HouseOfTongues] Error getting mastery stats:", error);
    return { success: false, stats: null, message: "Failed to fetch stats" };
  }
}

/**
 * Create a Living Scroll (blockchain-anchored language mastery certificate)
 */
export async function createLivingScroll(
  studentProfileId: number,
  languageId: number
) {
  const database = getDb();
  if (!database) {
    return { success: false, message: "Database not available" };
  }

  try {
    // Verify mastery level
    const masteryResult = await getLanguageMasteryStats(studentProfileId, languageId);
    if (!masteryResult.success || !masteryResult.stats) {
      return { success: false, message: "Could not verify mastery level" };
    }

    if (masteryResult.stats.masteryPercentage < 70) {
      return {
        success: false,
        message: `Mastery level too low (${masteryResult.stats.masteryPercentage}%). Need at least 70% to create a Living Scroll.`,
      };
    }

    // Get language details
    const language = await database
      .select()
      .from(academyLanguages)
      .where(eq(academyLanguages.id, languageId))
      .limit(1);

    if (language.length === 0) {
      return { success: false, message: "Language not found" };
    }

    // Get student profile
    const profile = await database
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.id, studentProfileId))
      .limit(1);

    if (profile.length === 0) {
      return { success: false, message: "Student profile not found" };
    }

    // Generate scroll hash
    const scrollData = {
      studentProfileId,
      languageId,
      languageName: language[0].name,
      masteryLevel: masteryResult.stats.masteryLevel,
      masteryPercentage: masteryResult.stats.masteryPercentage,
      averageScore: masteryResult.stats.averageScore,
      completedLessons: masteryResult.stats.completedLessons,
      issuedAt: new Date().toISOString(),
    };

    const crypto = await import("crypto");
    const scrollHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(scrollData) + Math.random().toString())
      .digest("hex");

    // Award mastery tokens
    await awardLanguageTokens(
      profile[0].userId,
      LANGUAGE_TOKEN_REWARDS.language_mastery,
      `Living Scroll: ${language[0].name} ${masteryResult.stats.masteryLevel}`
    );

    return {
      success: true,
      scroll: {
        ...scrollData,
        scrollHash,
        verificationUrl: `/scrolls/verify/${scrollHash}`,
      },
      tokensAwarded: LANGUAGE_TOKEN_REWARDS.language_mastery,
      message: `Living Scroll created for ${language[0].name} mastery!`,
    };
  } catch (error) {
    console.error("[HouseOfTongues] Error creating Living Scroll:", error);
    return { success: false, message: "Failed to create Living Scroll" };
  }
}

/**
 * Seed initial languages into database
 */
export async function seedLanguages() {
  const database = getDb();
  if (!database) {
    return { success: false, message: "Database not available" };
  }

  try {
    // Check if languages already exist
    const existing = await database.select().from(academyLanguages).limit(1);
    if (existing.length > 0) {
      return { success: true, message: "Languages already seeded", count: 0 };
    }

    // Insert all languages
    for (const lang of ALL_LANGUAGES) {
      await database.insert(academyLanguages).values({
        name: lang.name,
        nativeName: lang.nativeName,
        slug: lang.slug,
        category: lang.category,
        iconEmoji: lang.iconEmoji,
        culturalContext: lang.culturalContext,
        description: `Learn ${lang.name} (${lang.nativeName}) - ${lang.culturalContext}`,
        status: "active",
      });
    }

    return { success: true, message: "Languages seeded successfully", count: ALL_LANGUAGES.length };
  } catch (error) {
    console.error("[HouseOfTongues] Error seeding languages:", error);
    return { success: false, message: "Failed to seed languages" };
  }
}

/**
 * Seed sample lessons for a language
 */
export async function seedLanguageLessons(languageId: number, languageName: string) {
  const database = getDb();
  if (!database) {
    return { success: false, message: "Database not available" };
  }

  const lessonTemplates = [
    // Beginner
    { title: `${languageName} Greetings`, level: "beginner", lessonType: "vocabulary", orderIndex: 1, tokensReward: 15 },
    { title: `Basic Pronunciation`, level: "beginner", lessonType: "pronunciation", orderIndex: 2, tokensReward: 20 },
    { title: `Numbers 1-10`, level: "beginner", lessonType: "vocabulary", orderIndex: 3, tokensReward: 15 },
    { title: `Family Words`, level: "beginner", lessonType: "vocabulary", orderIndex: 4, tokensReward: 15 },
    { title: `Simple Conversations`, level: "beginner", lessonType: "conversation", orderIndex: 5, tokensReward: 25 },
    // Intermediate
    { title: `Cultural Stories`, level: "intermediate", lessonType: "story", orderIndex: 6, tokensReward: 35 },
    { title: `Advanced Vocabulary`, level: "intermediate", lessonType: "vocabulary", orderIndex: 7, tokensReward: 20 },
    { title: `Traditional Chants`, level: "intermediate", lessonType: "chant", orderIndex: 8, tokensReward: 40 },
    { title: `Daily Conversations`, level: "intermediate", lessonType: "conversation", orderIndex: 9, tokensReward: 30 },
    // Advanced
    { title: `Ceremonial Language`, level: "advanced", lessonType: "ceremony", orderIndex: 10, tokensReward: 50 },
    { title: `Sacred Stories`, level: "advanced", lessonType: "story", orderIndex: 11, tokensReward: 45 },
    { title: `Mastery Chants`, level: "advanced", lessonType: "chant", orderIndex: 12, tokensReward: 50 },
  ];

  try {
    for (const lesson of lessonTemplates) {
      await database.insert(languageLessons).values({
        languageId,
        title: lesson.title,
        level: lesson.level as any,
        lessonType: lesson.lessonType as any,
        orderIndex: lesson.orderIndex,
        tokensReward: lesson.tokensReward,
        status: "active",
        content: {
          type: lesson.lessonType,
          sections: [
            { title: "Introduction", content: `Welcome to ${lesson.title}` },
            { title: "Practice", content: "Practice exercises will appear here" },
            { title: "Quiz", content: "Test your knowledge" },
          ],
        },
      });
    }

    return { success: true, message: `Seeded ${lessonTemplates.length} lessons for ${languageName}` };
  } catch (error) {
    console.error("[HouseOfTongues] Error seeding lessons:", error);
    return { success: false, message: "Failed to seed lessons" };
  }
}
