import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  specialistTracks, 
  specialistMaturityAssessments, 
  specialistMilestones 
} from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";

/**
 * Specialist Tracks Router
 * 
 * Manages entry-level career progression for family members with:
 * - Age-based eligibility (16+ with work permit, 18+ full)
 * - Education requirement (HS diploma OR Academy graduation)
 * - Part-time start (20-25 hrs/week) progressing to full-time
 * - 3-5 year progression timeline with acceleration options
 * 
 * Progression Levels:
 * - Specialist I: Entry - Part-time, supervised, learning fundamentals
 * - Specialist II: Developing - Increased hours, more autonomy
 * - Specialist III: Proficient - Full-time eligible, project ownership
 * - Associate: Bridge - Transition to standard career track
 */

// Progression requirements
const PROGRESSION_REQUIREMENTS = {
  specialist_i: {
    minMonths: 6,
    minMaturityScore: 0,
    minHoursWorked: 500,
    nextLevel: "specialist_ii",
    acceleratedMinMonths: 4,
    acceleratedMinScore: 75,
  },
  specialist_ii: {
    minMonths: 12,
    minMaturityScore: 60,
    minHoursWorked: 1500,
    nextLevel: "specialist_iii",
    acceleratedMinMonths: 8,
    acceleratedMinScore: 80,
  },
  specialist_iii: {
    minMonths: 18,
    minMaturityScore: 70,
    minHoursWorked: 3000,
    nextLevel: "associate",
    acceleratedMinMonths: 12,
    acceleratedMinScore: 85,
  },
  associate: {
    minMonths: 0,
    minMaturityScore: 80,
    minHoursWorked: 5000,
    nextLevel: null,
    acceleratedMinMonths: 0,
    acceleratedMinScore: 0,
  },
};

// Employment type hours mapping
const HOURS_PER_WEEK = {
  part_time_20: 20,
  part_time_25: 25,
  part_time_30: 30,
  full_time: 40,
};

export const specialistTracksRouter = router({
  // Create a new specialist track
  createTrack: protectedProcedure
    .input(z.object({
      familyMemberId: z.string().optional(), // Optional - for family member linking
      candidateType: z.enum(["family", "external", "academy_graduate", "community"]).default("external"),
      fullName: z.string(),
      dateOfBirth: z.string().optional(),
      hasWorkPermit: z.boolean().default(false),
      workPermitExpiry: z.string().optional(),
      educationStatus: z.enum([
        "in_high_school",
        "high_school_diploma",
        "academy_enrolled",
        "academy_graduate",
        "ged",
        "college_enrolled",
        "college_graduate"
      ]),
      entityId: z.string().optional(),
      entityName: z.string().optional(),
      department: z.string().optional(),
      positionTitle: z.string().optional(),
      supervisorId: z.string().optional(),
      supervisorName: z.string().optional(),
      hourlyRate: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Calculate age if DOB provided
      let currentAge: number | undefined;
      if (input.dateOfBirth) {
        const dob = new Date(input.dateOfBirth);
        const today = new Date();
        currentAge = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          currentAge--;
        }
      }

      // Check eligibility
      const isEligible = checkEligibility(currentAge, input.hasWorkPermit, input.educationStatus);
      
      // Calculate expected graduation (3-5 years from now)
      const expectedGraduation = new Date();
      expectedGraduation.setFullYear(expectedGraduation.getFullYear() + 4); // Default 4 years

      const result = await db.insert(specialistTracks).values({
        familyMemberId: input.familyMemberId || `ext-${Date.now()}`, // Generate ID for external candidates
        fullName: input.fullName,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        currentAge,
        hasWorkPermit: input.hasWorkPermit,
        workPermitExpiry: input.workPermitExpiry ? new Date(input.workPermitExpiry) : null,
        educationStatus: input.educationStatus,
        currentLevel: "specialist_i",
        employmentType: "part_time_20",
        entityId: input.entityId,
        entityName: input.entityName,
        department: input.department,
        positionTitle: input.positionTitle,
        supervisorId: input.supervisorId,
        supervisorName: input.supervisorName,
        hourlyRate: input.hourlyRate?.toString(),
        trackStartDate: new Date(),
        currentLevelStartDate: new Date(),
        expectedGraduationDate: expectedGraduation,
        status: isEligible ? "active" : "pending_eligibility",
        notes: input.notes,
      });

      return { 
        id: result[0].insertId, 
        isEligible,
        message: isEligible 
          ? "Specialist track created and activated" 
          : "Specialist track created but pending eligibility verification"
      };
    }),

  // Get all specialist tracks
  getAllTracks: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const tracks = await db
      .select()
      .from(specialistTracks)
      .orderBy(desc(specialistTracks.createdAt));

    return tracks;
  }),

  // Get track by ID
  getTrackById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const tracks = await db
        .select()
        .from(specialistTracks)
        .where(eq(specialistTracks.id, input.id))
        .limit(1);

      return tracks[0] || null;
    }),

  // Get track by family member
  getTrackByFamilyMember: publicProcedure
    .input(z.object({ familyMemberId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const tracks = await db
        .select()
        .from(specialistTracks)
        .where(eq(specialistTracks.familyMemberId, input.familyMemberId))
        .limit(1);

      return tracks[0] || null;
    }),

  // Update track
  updateTrack: protectedProcedure
    .input(z.object({
      id: z.number(),
      employmentType: z.enum(["part_time_20", "part_time_25", "part_time_30", "full_time"]).optional(),
      entityId: z.string().optional(),
      entityName: z.string().optional(),
      department: z.string().optional(),
      positionTitle: z.string().optional(),
      supervisorId: z.string().optional(),
      supervisorName: z.string().optional(),
      hourlyRate: z.number().optional(),
      tokenAllocationMonthly: z.number().optional(),
      status: z.enum(["pending_eligibility", "active", "on_hold", "graduated", "terminated", "transferred"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updates } = input;
      
      await db
        .update(specialistTracks)
        .set({
          ...updates,
          hourlyRate: updates.hourlyRate?.toString(),
        })
        .where(eq(specialistTracks.id, id));

      return { success: true };
    }),

  // Check progression eligibility
  checkProgressionEligibility: publicProcedure
    .input(z.object({ trackId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { eligible: false, reason: "Database not available" };

      const tracks = await db
        .select()
        .from(specialistTracks)
        .where(eq(specialistTracks.id, input.trackId))
        .limit(1);

      const track = tracks[0];
      if (!track) return { eligible: false, reason: "Track not found" };

      const currentLevel = track.currentLevel as keyof typeof PROGRESSION_REQUIREMENTS;
      const requirements = PROGRESSION_REQUIREMENTS[currentLevel];
      
      if (!requirements.nextLevel) {
        return { 
          eligible: false, 
          reason: "Already at highest level (Associate)",
          currentLevel: track.currentLevel,
        };
      }

      // Calculate months at current level
      const levelStartDate = track.currentLevelStartDate || track.trackStartDate;
      const monthsAtLevel = levelStartDate 
        ? Math.floor((Date.now() - new Date(levelStartDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
        : 0;

      // Check requirements
      const isAccelerated = track.acceleratedTrack;
      const minMonths = isAccelerated ? requirements.acceleratedMinMonths : requirements.minMonths;
      const minScore = isAccelerated ? requirements.acceleratedMinScore : requirements.minMaturityScore;

      const meetsTimeRequirement = monthsAtLevel >= minMonths;
      const meetsScoreRequirement = track.maturityScore >= minScore;

      const eligible = meetsTimeRequirement && meetsScoreRequirement;

      return {
        eligible,
        currentLevel: track.currentLevel,
        nextLevel: requirements.nextLevel,
        monthsAtLevel,
        maturityScore: track.maturityScore,
        requirements: {
          minMonths,
          minScore,
          isAccelerated,
        },
        meetsTimeRequirement,
        meetsScoreRequirement,
        reason: !eligible 
          ? `Need ${!meetsTimeRequirement ? `${minMonths - monthsAtLevel} more months` : ""} ${!meetsTimeRequirement && !meetsScoreRequirement ? "and " : ""}${!meetsScoreRequirement ? `${minScore - track.maturityScore} more maturity points` : ""}`
          : "Eligible for advancement",
      };
    }),

  // Advance to next level
  advanceLevel: protectedProcedure
    .input(z.object({
      trackId: z.number(),
      justification: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const tracks = await db
        .select()
        .from(specialistTracks)
        .where(eq(specialistTracks.id, input.trackId))
        .limit(1);

      const track = tracks[0];
      if (!track) throw new Error("Track not found");

      const currentLevel = track.currentLevel as keyof typeof PROGRESSION_REQUIREMENTS;
      const requirements = PROGRESSION_REQUIREMENTS[currentLevel];
      
      if (!requirements.nextLevel) {
        throw new Error("Already at highest level");
      }

      const previousLevel = track.currentLevel;
      const newLevel = requirements.nextLevel;

      // Update track
      await db
        .update(specialistTracks)
        .set({
          currentLevel: newLevel as any,
          currentLevelStartDate: new Date(),
          // Upgrade employment type if advancing to Specialist III or Associate
          employmentType: newLevel === "specialist_iii" || newLevel === "associate" 
            ? "part_time_30" 
            : track.employmentType,
        })
        .where(eq(specialistTracks.id, input.trackId));

      // Create milestone
      await db.insert(specialistMilestones).values({
        specialistTrackId: input.trackId,
        milestoneType: "level_advancement",
        title: `Advanced to ${formatLevel(newLevel)}`,
        description: input.justification || `Successfully completed ${formatLevel(previousLevel)} requirements`,
        previousLevel,
        newLevel,
        tokenBonus: getTokenBonusForLevel(newLevel),
        ceremonyScheduled: true,
      });

      return { 
        success: true, 
        previousLevel, 
        newLevel,
        tokenBonus: getTokenBonusForLevel(newLevel),
      };
    }),

  // Create maturity assessment
  createAssessment: protectedProcedure
    .input(z.object({
      specialistTrackId: z.number(),
      assessmentPeriod: z.string(),
      assessorId: z.string().optional(),
      assessorName: z.string().optional(),
      // Academy scores
      academyModulesCompleted: z.number().default(0),
      academyModulesTarget: z.number().default(3),
      academyNotes: z.string().optional(),
      // Simulator scores
      simulatorSessionsCompleted: z.number().default(0),
      simulatorAverageScore: z.number().default(0),
      simulatorNotes: z.string().optional(),
      // Supervisor ratings (1-5 each)
      attendanceRating: z.number().min(1).max(5).default(3),
      punctualityRating: z.number().min(1).max(5).default(3),
      initiativeRating: z.number().min(1).max(5).default(3),
      teamworkRating: z.number().min(1).max(5).default(3),
      qualityOfWorkRating: z.number().min(1).max(5).default(3),
      supervisorComments: z.string().optional(),
      // Token economy
      tokensEarned: z.number().default(0),
      tokensSpentWisely: z.boolean().default(false),
      tokenSavingsRate: z.number().optional(),
      tokenEconomyNotes: z.string().optional(),
      // Fiscal responsibility
      budgetAdherence: z.boolean().default(false),
      expenseReportingAccuracy: z.number().default(0),
      financialGoalsMet: z.number().default(0),
      fiscalNotes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Calculate component scores
      const academyScore = calculateAcademyScore(input.academyModulesCompleted, input.academyModulesTarget);
      const simulatorScore = calculateSimulatorScore(input.simulatorSessionsCompleted, input.simulatorAverageScore);
      const supervisorScore = calculateSupervisorScore(
        input.attendanceRating,
        input.punctualityRating,
        input.initiativeRating,
        input.teamworkRating,
        input.qualityOfWorkRating
      );
      const tokenEconomyScore = calculateTokenEconomyScore(
        input.tokensEarned,
        input.tokensSpentWisely,
        input.tokenSavingsRate || 0
      );
      const fiscalScore = calculateFiscalScore(
        input.budgetAdherence,
        input.expenseReportingAccuracy,
        input.financialGoalsMet
      );

      const totalScore = academyScore + simulatorScore + supervisorScore + tokenEconomyScore + fiscalScore;

      // Determine advancement recommendation
      const recommendsAdvancement = totalScore >= 70;
      const recommendedLevel = recommendsAdvancement 
        ? await getRecommendedLevel(db, input.specialistTrackId)
        : null;

      const result = await db.insert(specialistMaturityAssessments).values({
        specialistTrackId: input.specialistTrackId,
        assessmentPeriod: input.assessmentPeriod,
        assessorId: input.assessorId,
        assessorName: input.assessorName,
        academyModulesCompleted: input.academyModulesCompleted,
        academyModulesTarget: input.academyModulesTarget,
        academyScore,
        academyNotes: input.academyNotes,
        simulatorSessionsCompleted: input.simulatorSessionsCompleted,
        simulatorAverageScore: input.simulatorAverageScore,
        simulatorScore,
        simulatorNotes: input.simulatorNotes,
        attendanceRating: input.attendanceRating,
        punctualityRating: input.punctualityRating,
        initiativeRating: input.initiativeRating,
        teamworkRating: input.teamworkRating,
        qualityOfWorkRating: input.qualityOfWorkRating,
        supervisorScore,
        supervisorComments: input.supervisorComments,
        tokensEarned: input.tokensEarned,
        tokensSpentWisely: input.tokensSpentWisely,
        tokenSavingsRate: input.tokenSavingsRate?.toString(),
        tokenEconomyScore,
        tokenEconomyNotes: input.tokenEconomyNotes,
        budgetAdherence: input.budgetAdherence,
        expenseReportingAccuracy: input.expenseReportingAccuracy,
        financialGoalsMet: input.financialGoalsMet,
        fiscalScore,
        fiscalNotes: input.fiscalNotes,
        totalScore,
        recommendsAdvancement,
        recommendedLevel: recommendedLevel as any,
        status: "submitted",
      });

      // Update track's maturity score
      await db
        .update(specialistTracks)
        .set({
          maturityScore: totalScore,
          lastMaturityAssessment: new Date(),
          // Enable accelerated track if score is high enough
          acceleratedTrack: totalScore >= 80,
        })
        .where(eq(specialistTracks.id, input.specialistTrackId));

      return {
        id: result[0].insertId,
        totalScore,
        breakdown: {
          academyScore,
          simulatorScore,
          supervisorScore,
          tokenEconomyScore,
          fiscalScore,
        },
        recommendsAdvancement,
        recommendedLevel,
      };
    }),

  // Get assessments for a track
  getAssessments: publicProcedure
    .input(z.object({ trackId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const assessments = await db
        .select()
        .from(specialistMaturityAssessments)
        .where(eq(specialistMaturityAssessments.specialistTrackId, input.trackId))
        .orderBy(desc(specialistMaturityAssessments.assessmentDate));

      return assessments;
    }),

  // Get milestones for a track
  getMilestones: publicProcedure
    .input(z.object({ trackId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const milestones = await db
        .select()
        .from(specialistMilestones)
        .where(eq(specialistMilestones.specialistTrackId, input.trackId))
        .orderBy(desc(specialistMilestones.achievedAt));

      return milestones;
    }),

  // Create milestone
  createMilestone: protectedProcedure
    .input(z.object({
      specialistTrackId: z.number(),
      milestoneType: z.enum([
        "level_advancement",
        "hours_milestone",
        "academy_completion",
        "simulator_mastery",
        "first_project_lead",
        "mentorship_start",
        "full_time_transition",
        "graduation_ceremony"
      ]),
      title: z.string(),
      description: z.string().optional(),
      tokenBonus: z.number().default(0),
      ceremonyScheduled: z.boolean().default(false),
      ceremonyDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(specialistMilestones).values({
        specialistTrackId: input.specialistTrackId,
        milestoneType: input.milestoneType,
        title: input.title,
        description: input.description,
        tokenBonus: input.tokenBonus,
        ceremonyScheduled: input.ceremonyScheduled,
        ceremonyDate: input.ceremonyDate ? new Date(input.ceremonyDate) : null,
      });

      return { id: result[0].insertId };
    }),

  // Get statistics
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        totalTracks: 0,
        activeTracks: 0,
        pendingEligibility: 0,
        graduated: 0,
        byLevel: {
          specialist_i: 0,
          specialist_ii: 0,
          specialist_iii: 0,
          associate: 0,
        },
        acceleratedTracks: 0,
        averageMaturityScore: 0,
      };
    }

    const tracks = await db.select().from(specialistTracks);

    const activeTracks = tracks.filter(t => t.status === "active");
    const acceleratedTracks = tracks.filter(t => t.acceleratedTrack);
    const avgScore = activeTracks.length > 0
      ? Math.round(activeTracks.reduce((sum, t) => sum + t.maturityScore, 0) / activeTracks.length)
      : 0;

    return {
      totalTracks: tracks.length,
      activeTracks: activeTracks.length,
      pendingEligibility: tracks.filter(t => t.status === "pending_eligibility").length,
      graduated: tracks.filter(t => t.status === "graduated").length,
      byLevel: {
        specialist_i: tracks.filter(t => t.currentLevel === "specialist_i").length,
        specialist_ii: tracks.filter(t => t.currentLevel === "specialist_ii").length,
        specialist_iii: tracks.filter(t => t.currentLevel === "specialist_iii").length,
        associate: tracks.filter(t => t.currentLevel === "associate").length,
      },
      acceleratedTracks: acceleratedTracks.length,
      averageMaturityScore: avgScore,
    };
  }),

  // Delete track
  deleteTrack: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(specialistTracks).where(eq(specialistTracks.id, input.id));
      return { success: true };
    }),
});

// Helper functions
function checkEligibility(
  age: number | undefined, 
  hasWorkPermit: boolean, 
  educationStatus: string
): boolean {
  // Age check: 18+ or 16+ with work permit
  if (age !== undefined) {
    if (age < 16) return false;
    if (age < 18 && !hasWorkPermit) return false;
  }

  // Education check: HS diploma, GED, or Academy graduate
  const validEducation = [
    "high_school_diploma",
    "academy_graduate",
    "ged",
    "college_enrolled",
    "college_graduate"
  ];
  
  return validEducation.includes(educationStatus);
}

function formatLevel(level: string): string {
  const labels: Record<string, string> = {
    specialist_i: "Specialist I",
    specialist_ii: "Specialist II",
    specialist_iii: "Specialist III",
    associate: "Associate",
  };
  return labels[level] || level;
}

function getTokenBonusForLevel(level: string): number {
  const bonuses: Record<string, number> = {
    specialist_ii: 100,
    specialist_iii: 250,
    associate: 500,
  };
  return bonuses[level] || 0;
}

// Score calculation functions (each out of their max points)
function calculateAcademyScore(completed: number, target: number): number {
  // Max 20 points
  if (target === 0) return 10; // Default if no target
  const ratio = Math.min(completed / target, 1.5); // Cap at 150%
  return Math.round(ratio * 20);
}

function calculateSimulatorScore(sessions: number, avgScore: number): number {
  // Max 20 points
  // Sessions: up to 10 points (2 points per session, max 5 sessions)
  const sessionPoints = Math.min(sessions * 2, 10);
  // Average score: up to 10 points (score/10)
  const scorePoints = Math.min(avgScore / 10, 10);
  return Math.round(sessionPoints + scorePoints);
}

function calculateSupervisorScore(
  attendance: number,
  punctuality: number,
  initiative: number,
  teamwork: number,
  quality: number
): number {
  // Max 25 points (5 ratings × 5 max each)
  return attendance + punctuality + initiative + teamwork + quality;
}

function calculateTokenEconomyScore(
  earned: number,
  spentWisely: boolean,
  savingsRate: number
): number {
  // Max 15 points
  let score = 0;
  // Tokens earned: up to 5 points
  score += Math.min(earned / 100, 5);
  // Spent wisely: 5 points
  if (spentWisely) score += 5;
  // Savings rate: up to 5 points (1 point per 10% saved)
  score += Math.min(savingsRate / 10, 5);
  return Math.round(score);
}

function calculateFiscalScore(
  budgetAdherence: boolean,
  reportingAccuracy: number,
  goalsMet: number
): number {
  // Max 20 points
  let score = 0;
  // Budget adherence: 8 points
  if (budgetAdherence) score += 8;
  // Reporting accuracy: up to 6 points (percentage/100 * 6)
  score += Math.round((reportingAccuracy / 100) * 6);
  // Goals met: up to 6 points (2 per goal, max 3)
  score += Math.min(goalsMet * 2, 6);
  return score;
}

async function getRecommendedLevel(db: any, trackId: number): Promise<string | null> {
  const tracks = await db
    .select()
    .from(specialistTracks)
    .where(eq(specialistTracks.id, trackId))
    .limit(1);

  const track = tracks[0];
  if (!track) return null;

  const currentLevel = track.currentLevel as keyof typeof PROGRESSION_REQUIREMENTS;
  const requirements = PROGRESSION_REQUIREMENTS[currentLevel];
  
  return requirements.nextLevel;
}
