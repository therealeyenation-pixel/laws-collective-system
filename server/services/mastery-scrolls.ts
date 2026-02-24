/**
 * Mastery Scrolls Service
 * Phase 19.5: Blockchain-anchored completion certificates for Academy
 */

import { db, getDb } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  certificates,
  studentProfiles,
  studentProgress,
  academyCourses,
  academyHouses,
  academyLanguages,
  blockchainRecords,
  tokenTransactions,
  luvLedgerAccounts,
} from "../../drizzle/schema";

// Scroll Types
export type ScrollType =
  | "course_completion"
  | "module_mastery"
  | "house_graduation"
  | "language_mastery"
  | "ceremonial_achievement"
  | "sovereign_scholar";

// Scroll Templates
export const SCROLL_TEMPLATES = {
  course_completion: {
    name: "Scroll of Completion",
    ceremonialTitle: "The Scroll of Knowledge Attained",
    description: "Awarded upon successful completion of a course within the Academy",
    tokensAwarded: 100,
    validityYears: null, // Never expires
  },
  module_mastery: {
    name: "Scroll of Mastery",
    ceremonialTitle: "The Scroll of Wisdom Embodied",
    description: "Awarded for mastering an entire Divine STEM module",
    tokensAwarded: 300,
    validityYears: null,
  },
  house_graduation: {
    name: "Scroll of Passage",
    ceremonialTitle: "The Scroll of Sacred Transition",
    description: "Awarded upon graduation from a Learning House",
    tokensAwarded: 750,
    validityYears: null,
  },
  language_mastery: {
    name: "Living Scroll",
    ceremonialTitle: "The Living Scroll of Tongues",
    description: "Awarded for achieving mastery in a language from the House of Many Tongues",
    tokensAwarded: 500,
    validityYears: null,
  },
  ceremonial_achievement: {
    name: "Scroll of Honor",
    ceremonialTitle: "The Scroll of Ceremonial Honor",
    description: "Awarded for exceptional participation in ceremonial activities",
    tokensAwarded: 200,
    validityYears: null,
  },
  sovereign_scholar: {
    name: "Sovereign Scholar Scroll",
    ceremonialTitle: "The Scroll of Sovereign Scholarship",
    description: "The highest honor - awarded upon completing all three Learning Houses",
    tokensAwarded: 2000,
    validityYears: null,
  },
};

// Scroll Status
export type ScrollStatus = "pending" | "issued" | "verified" | "revoked";

/**
 * Generate a unique scroll hash
 */
function generateScrollHash(data: object): string {
  const crypto = require("crypto");
  const timestamp = Date.now();
  const randomSalt = crypto.randomBytes(16).toString("hex");
  const dataString = JSON.stringify(data) + timestamp + randomSalt;
  return crypto.createHash("sha256").update(dataString).digest("hex");
}

/**
 * Create a Mastery Scroll
 */
export async function createMasteryScroll(params: {
  userId: number;
  studentProfileId: number;
  scrollType: ScrollType;
  achievementId?: number; // courseId, moduleId, houseId, or languageId
  achievementName: string;
  metadata?: Record<string, any>;
}) {
  const database = getDb();
  if (!database) {
    return { success: false, message: "Database not available" };
  }

  const { userId, studentProfileId, scrollType, achievementId, achievementName, metadata } = params;
  const template = SCROLL_TEMPLATES[scrollType];

  try {
    // Generate scroll data
    const scrollData = {
      type: scrollType,
      template: template.name,
      ceremonialTitle: template.ceremonialTitle,
      achievementId,
      achievementName,
      studentProfileId,
      userId,
      issuedAt: new Date().toISOString(),
      metadata: metadata || {},
    };

    // Generate blockchain-compatible hash
    const scrollHash = generateScrollHash(scrollData);

    // Create certificate record
    const result = await database
      .insert(certificates)
      .values({
        userId,
        simulatorSessionId: achievementId || 0, // Repurpose for achievement reference
        certificateType: scrollType,
        title: `${template.name}: ${achievementName}`,
        certificateHash: scrollHash,
        metadata: JSON.stringify({
          ...scrollData,
          scrollHash,
          verificationUrl: `/scrolls/verify/${scrollHash}`,
        }),
      })
      .$returningId();

    // Record on blockchain
    await recordScrollOnBlockchain(scrollHash, scrollData, userId);

    // Award tokens
    await awardScrollTokens(userId, template.tokensAwarded, `${template.name}: ${achievementName}`);

    return {
      success: true,
      scroll: {
        id: result[0].id,
        scrollHash,
        type: scrollType,
        name: template.name,
        ceremonialTitle: template.ceremonialTitle,
        achievementName,
        tokensAwarded: template.tokensAwarded,
        verificationUrl: `/scrolls/verify/${scrollHash}`,
        issuedAt: scrollData.issuedAt,
      },
      message: `${template.name} created successfully`,
    };
  } catch (error) {
    console.error("[MasteryScrolls] Error creating scroll:", error);
    return { success: false, message: "Failed to create Mastery Scroll" };
  }
}

/**
 * Record scroll on blockchain
 */
async function recordScrollOnBlockchain(
  scrollHash: string,
  scrollData: object,
  userId: number
) {
  const database = getDb();
  if (!database) return;

  try {
    await database.insert(blockchainRecords).values({
      recordType: "mastery_scroll",
      entityType: "certificate",
      entityId: scrollHash,
      transactionHash: scrollHash,
      blockNumber: Math.floor(Date.now() / 1000), // Simulated block number
      data: JSON.stringify(scrollData),
      status: "confirmed",
      userId,
    });
  } catch (error) {
    console.error("[MasteryScrolls] Error recording on blockchain:", error);
  }
}

/**
 * Award tokens for scroll achievement
 */
async function awardScrollTokens(userId: number, amount: number, description: string) {
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
      source: "mastery_scroll",
      description,
    });
  } catch (error) {
    console.error("[MasteryScrolls] Error awarding tokens:", error);
  }
}

/**
 * Verify a scroll by hash
 */
export async function verifyScroll(scrollHash: string) {
  const database = getDb();
  if (!database) {
    return { success: false, verified: false, message: "Database not available" };
  }

  try {
    // Find certificate by hash
    const cert = await database
      .select()
      .from(certificates)
      .where(eq(certificates.certificateHash, scrollHash))
      .limit(1);

    if (cert.length === 0) {
      return { success: true, verified: false, message: "Scroll not found" };
    }

    // Find blockchain record
    const blockchainRecord = await database
      .select()
      .from(blockchainRecords)
      .where(eq(blockchainRecords.entityId, scrollHash))
      .limit(1);

    // Get student profile
    const profile = await database
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, cert[0].userId))
      .limit(1);

    const metadata = cert[0].metadata ? JSON.parse(cert[0].metadata as string) : {};

    return {
      success: true,
      verified: true,
      scroll: {
        hash: scrollHash,
        type: cert[0].certificateType,
        title: cert[0].title,
        issuedAt: cert[0].issuedAt,
        studentName: profile[0]?.displayName || "Unknown",
        blockchainConfirmed: blockchainRecord.length > 0,
        blockNumber: blockchainRecord[0]?.blockNumber,
        metadata,
      },
      message: "Scroll verified successfully",
    };
  } catch (error) {
    console.error("[MasteryScrolls] Error verifying scroll:", error);
    return { success: false, verified: false, message: "Verification failed" };
  }
}

/**
 * Get all scrolls for a user
 */
export async function getUserScrolls(userId: number) {
  const database = getDb();
  if (!database) {
    return { success: false, scrolls: [], message: "Database not available" };
  }

  try {
    const scrolls = await database
      .select()
      .from(certificates)
      .where(eq(certificates.userId, userId))
      .orderBy(desc(certificates.issuedAt));

    const formattedScrolls = scrolls.map(scroll => {
      const metadata = scroll.metadata ? JSON.parse(scroll.metadata as string) : {};
      return {
        id: scroll.id,
        hash: scroll.certificateHash,
        type: scroll.certificateType,
        title: scroll.title,
        issuedAt: scroll.issuedAt,
        verificationUrl: `/scrolls/verify/${scroll.certificateHash}`,
        metadata,
      };
    });

    return { success: true, scrolls: formattedScrolls };
  } catch (error) {
    console.error("[MasteryScrolls] Error getting scrolls:", error);
    return { success: false, scrolls: [], message: "Failed to fetch scrolls" };
  }
}

/**
 * Get scroll statistics for a user
 */
export async function getScrollStats(userId: number) {
  const database = getDb();
  if (!database) {
    return { success: false, stats: null, message: "Database not available" };
  }

  try {
    const scrolls = await database
      .select()
      .from(certificates)
      .where(eq(certificates.userId, userId));

    const stats = {
      totalScrolls: scrolls.length,
      byType: {} as Record<string, number>,
      totalTokensFromScrolls: 0,
      hasSovereignScholar: false,
    };

    scrolls.forEach(scroll => {
      const type = scroll.certificateType as ScrollType;
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      stats.totalTokensFromScrolls += SCROLL_TEMPLATES[type]?.tokensAwarded || 0;
      if (type === "sovereign_scholar") {
        stats.hasSovereignScholar = true;
      }
    });

    return { success: true, stats };
  } catch (error) {
    console.error("[MasteryScrolls] Error getting stats:", error);
    return { success: false, stats: null, message: "Failed to fetch stats" };
  }
}

/**
 * Check if user qualifies for Sovereign Scholar scroll
 */
export async function checkSovereignScholarEligibility(userId: number) {
  const database = getDb();
  if (!database) {
    return { success: false, eligible: false, message: "Database not available" };
  }

  try {
    // Check for all three house graduation scrolls
    const graduationScrolls = await database
      .select()
      .from(certificates)
      .where(and(
        eq(certificates.userId, userId),
        eq(certificates.certificateType, "house_graduation")
      ));

    // Need at least 3 house graduations (Wonder, Form, Mastery)
    const eligible = graduationScrolls.length >= 3;

    // Check if already has Sovereign Scholar
    const existingSovereign = await database
      .select()
      .from(certificates)
      .where(and(
        eq(certificates.userId, userId),
        eq(certificates.certificateType, "sovereign_scholar")
      ))
      .limit(1);

    if (existingSovereign.length > 0) {
      return {
        success: true,
        eligible: false,
        alreadyAwarded: true,
        message: "Sovereign Scholar scroll already awarded",
      };
    }

    return {
      success: true,
      eligible,
      houseGraduations: graduationScrolls.length,
      requiredGraduations: 3,
      message: eligible
        ? "Eligible for Sovereign Scholar scroll!"
        : `Need ${3 - graduationScrolls.length} more house graduation(s)`,
    };
  } catch (error) {
    console.error("[MasteryScrolls] Error checking eligibility:", error);
    return { success: false, eligible: false, message: "Eligibility check failed" };
  }
}

/**
 * Award Sovereign Scholar scroll
 */
export async function awardSovereignScholar(userId: number, studentProfileId: number) {
  const eligibility = await checkSovereignScholarEligibility(userId);
  
  if (!eligibility.success) {
    return eligibility;
  }

  if (!eligibility.eligible) {
    return {
      success: false,
      message: eligibility.message,
    };
  }

  // Create the Sovereign Scholar scroll
  return createMasteryScroll({
    userId,
    studentProfileId,
    scrollType: "sovereign_scholar",
    achievementName: "Complete Academy Journey",
    metadata: {
      completedHouses: ["wonder", "form", "mastery"],
      awardedAt: new Date().toISOString(),
      honor: "Highest Academy Achievement",
    },
  });
}

/**
 * Get scroll templates
 */
export function getScrollTemplates() {
  return {
    success: true,
    templates: Object.entries(SCROLL_TEMPLATES).map(([key, template]) => ({
      type: key,
      ...template,
    })),
  };
}

/**
 * Create course completion scroll
 */
export async function createCourseCompletionScroll(
  userId: number,
  studentProfileId: number,
  courseId: number
) {
  const database = getDb();
  if (!database) {
    return { success: false, message: "Database not available" };
  }

  try {
    // Get course details
    const course = await database
      .select()
      .from(academyCourses)
      .where(eq(academyCourses.id, courseId))
      .limit(1);

    if (course.length === 0) {
      return { success: false, message: "Course not found" };
    }

    return createMasteryScroll({
      userId,
      studentProfileId,
      scrollType: "course_completion",
      achievementId: courseId,
      achievementName: course[0].title,
      metadata: {
        courseTitle: course[0].title,
        scrollTitle: course[0].scrollTitle,
        level: course[0].level,
      },
    });
  } catch (error) {
    console.error("[MasteryScrolls] Error creating course scroll:", error);
    return { success: false, message: "Failed to create course completion scroll" };
  }
}

/**
 * Create house graduation scroll
 */
export async function createHouseGraduationScroll(
  userId: number,
  studentProfileId: number,
  houseId: number
) {
  const database = getDb();
  if (!database) {
    return { success: false, message: "Database not available" };
  }

  try {
    // Get house details
    const house = await database
      .select()
      .from(academyHouses)
      .where(eq(academyHouses.id, houseId))
      .limit(1);

    if (house.length === 0) {
      return { success: false, message: "House not found" };
    }

    return createMasteryScroll({
      userId,
      studentProfileId,
      scrollType: "house_graduation",
      achievementId: houseId,
      achievementName: house[0].name,
      metadata: {
        houseName: house[0].name,
        ceremonialName: house[0].ceremonialName,
        gradeRange: house[0].gradeRange,
      },
    });
  } catch (error) {
    console.error("[MasteryScrolls] Error creating house scroll:", error);
    return { success: false, message: "Failed to create house graduation scroll" };
  }
}

/**
 * Create language mastery scroll
 */
export async function createLanguageMasteryScroll(
  userId: number,
  studentProfileId: number,
  languageId: number
) {
  const database = getDb();
  if (!database) {
    return { success: false, message: "Database not available" };
  }

  try {
    // Get language details
    const language = await database
      .select()
      .from(academyLanguages)
      .where(eq(academyLanguages.id, languageId))
      .limit(1);

    if (language.length === 0) {
      return { success: false, message: "Language not found" };
    }

    return createMasteryScroll({
      userId,
      studentProfileId,
      scrollType: "language_mastery",
      achievementId: languageId,
      achievementName: language[0].name,
      metadata: {
        languageName: language[0].name,
        nativeName: language[0].nativeName,
        category: language[0].category,
        culturalContext: language[0].culturalContext,
      },
    });
  } catch (error) {
    console.error("[MasteryScrolls] Error creating language scroll:", error);
    return { success: false, message: "Failed to create language mastery scroll" };
  }
}
