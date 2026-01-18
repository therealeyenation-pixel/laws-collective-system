import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { TRPCError } from "@trpc/server";

// System Phase definitions
const SYSTEM_PHASES = {
  build: {
    label: "Build Phase",
    description: "Infrastructure development. No transitions allowed.",
    transitionsEnabled: false,
  },
  stabilize: {
    label: "Stabilize Phase",
    description: "Testing and refinement. Limited transitions for founding members only.",
    transitionsEnabled: false,
  },
  operations: {
    label: "Operations Phase",
    description: "Full operations. Standard transitions enabled.",
    transitionsEnabled: true,
  },
} as const;

// Career Track definitions
const CAREER_TRACKS = {
  architect_manager: {
    label: "Architect/Manager Track",
    description: "Founding team members who build the system. 24-month minimum before transition.",
    minTenureMonths: 24,
    phases: ["onboarding", "year_1", "year_2", "transition_eligible"],
    boardEligible: true,
    isFounder: true,
  },
  coordinator_to_manager: {
    label: "Coordinator to Manager Track",
    description: "External hires who progress through the pipeline. Year 1 as Coordinator, Year 2 as Manager, then transition eligible.",
    minTenureMonths: 24,
    phases: ["onboarding", "year_1", "year_2", "transition_eligible"],
    boardEligible: false,
    isFounder: false,
  },
  permanent_staff: {
    label: "Permanent Staff Track",
    description: "Employees who opt out of business ownership. Capped growth, permanent employment.",
    minTenureMonths: null,
    phases: ["onboarding", "permanent"],
    boardEligible: false,
    isFounder: false,
  },
} as const;

// Benefits comparison data
const BENEFITS_COMPARISON = {
  employee: {
    healthInsurance: { value: "Company-paid (partial)", taxDeductible: false },
    retirement: { value: "401k with employer match", taxDeductible: false },
    pto: { value: "Fixed days (accrued)", taxDeductible: false },
    equipment: { value: "Company-provided", taxDeductible: false },
    homeOffice: { value: "Not deductible", taxDeductible: false },
    vehicle: { value: "Not deductible", taxDeductible: false },
    taxes: { value: "Withheld automatically", taxDeductible: false },
    incomeCeiling: { value: "Fixed salary", taxDeductible: false },
    unemployment: { value: "Eligible", taxDeductible: false },
    workersComp: { value: "Covered by employer", taxDeductible: false },
  },
  contractor: {
    healthInsurance: { value: "Self-paid", taxDeductible: true },
    retirement: { value: "SEP-IRA or Solo 401k (higher limits)", taxDeductible: true },
    pto: { value: "Unlimited (you decide)", taxDeductible: false },
    equipment: { value: "Self-purchased", taxDeductible: true },
    homeOffice: { value: "Fully deductible", taxDeductible: true },
    vehicle: { value: "Business use deductible", taxDeductible: true },
    taxes: { value: "Quarterly estimates (more control)", taxDeductible: false },
    incomeCeiling: { value: "Unlimited (multiple clients)", taxDeductible: false },
    unemployment: { value: "Not eligible", taxDeductible: false },
    workersComp: { value: "Must self-insure", taxDeductible: true },
  },
};

// Helper to get database
async function requireDb() {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database unavailable",
    });
  }
  return db;
}

// Helper type for raw query results
interface SystemSetting {
  id: number;
  settingKey: string;
  settingValue: string;
  settingType: string;
  description: string | null;
  updatedAt: Date | null;
  updatedBy: number | null;
}

interface CareerTrack {
  id: number;
  employeeId: number;
  trackType: string;
  currentPhase: string;
  startDate: Date;
  isFoundingMember: boolean;
  boardEligible: boolean;
  mentorEligible: boolean;
  year1CompletionDate: Date | null;
  year2CompletionDate: Date | null;
  transitionEligibleDate: Date | null;
  transitionStartDate: Date | null;
  transitionCompletedDate: Date | null;
  optedOutDate: Date | null;
  optOutReason: string | null;
  notes: string | null;
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string | null;
  position: string | null;
  hireDate: Date | null;
}

export const workforceDevelopmentRouter = router({
  // Get current system phase and settings
  getSystemSettings: protectedProcedure.query(async () => {
    const db = await requireDb();
    
    const [settings] = await (db as any).execute("SELECT * FROM system_settings");
    
    const settingsMap: Record<string, any> = {};
    (settings as SystemSetting[]).forEach((s) => {
      let value: string | number | boolean = s.settingValue;
      if (s.settingType === "number") value = parseInt(s.settingValue);
      if (s.settingType === "boolean") value = s.settingValue === "true";
      settingsMap[s.settingKey] = {
        value,
        type: s.settingType,
        description: s.description,
        updatedAt: s.updatedAt,
      };
    });

    const currentPhase = settingsMap.system_phase?.value || "build";
    
    return {
      settings: settingsMap,
      currentPhase,
      phaseInfo: SYSTEM_PHASES[currentPhase as keyof typeof SYSTEM_PHASES],
      transitionsEnabled: settingsMap.transition_enabled?.value || false,
      minTenureManager: settingsMap.min_tenure_manager_months?.value || 24,
      minTenureCoordinator: settingsMap.min_tenure_coordinator_months?.value || 24,
    };
  }),

  // Update system phase (admin only)
  updateSystemPhase: protectedProcedure
    .input(z.object({
      phase: z.enum(["build", "stabilize", "operations"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await requireDb();
      
      await (db as any).execute(
        "UPDATE system_settings SET settingValue = ?, updatedBy = ? WHERE settingKey = 'system_phase'",
        [input.phase, ctx.user.id]
      );

      // Auto-enable transitions if moving to operations phase
      if (input.phase === "operations") {
        await (db as any).execute(
          "UPDATE system_settings SET settingValue = 'true', updatedBy = ? WHERE settingKey = 'transition_enabled'",
          [ctx.user.id]
        );
      } else {
        await (db as any).execute(
          "UPDATE system_settings SET settingValue = 'false', updatedBy = ? WHERE settingKey = 'transition_enabled'",
          [ctx.user.id]
        );
      }

      return { success: true, newPhase: input.phase };
    }),

  // Get career track definitions
  getCareerTracks: publicProcedure.query(() => {
    return {
      tracks: CAREER_TRACKS,
      systemPhases: SYSTEM_PHASES,
    };
  }),

  // Get benefits comparison
  getBenefitsComparison: publicProcedure.query(() => {
    return BENEFITS_COMPARISON;
  }),

  // Get employee's career track
  getEmployeeCareerTrack: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await requireDb();
      
      // Get career track
      const [tracks] = await (db as any).execute(
        "SELECT * FROM career_tracks WHERE employeeId = ?",
        [input.employeeId]
      );
      
      const track = (tracks as CareerTrack[])[0];
      
      if (!track) {
        return null;
      }

      // Get employee details
      const [employees] = await (db as any).execute(
        "SELECT * FROM employees WHERE id = ?",
        [input.employeeId]
      );
      
      const employee = (employees as Employee[])[0];
      
      // Calculate tenure
      const startDate = new Date(track.startDate);
      const now = new Date();
      const tenureMonths = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      
      // Get track info
      const trackInfo = CAREER_TRACKS[track.trackType as keyof typeof CAREER_TRACKS];
      const minTenure = trackInfo?.minTenureMonths || 24;
      
      // Calculate milestones
      const year1Date = new Date(startDate);
      year1Date.setFullYear(year1Date.getFullYear() + 1);
      
      const year2Date = new Date(startDate);
      year2Date.setFullYear(year2Date.getFullYear() + 2);
      
      const transitionEligibleDate = new Date(startDate);
      transitionEligibleDate.setMonth(transitionEligibleDate.getMonth() + minTenure);

      return {
        ...track,
        employee,
        trackInfo,
        tenure: {
          months: tenureMonths,
          years: Math.floor(tenureMonths / 12),
          remainingMonths: tenureMonths % 12,
        },
        milestones: {
          year1: {
            date: year1Date,
            completed: now >= year1Date,
            daysRemaining: Math.max(0, Math.ceil((year1Date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
          },
          year2: {
            date: year2Date,
            completed: now >= year2Date,
            daysRemaining: Math.max(0, Math.ceil((year2Date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
          },
          transitionEligible: {
            date: transitionEligibleDate,
            eligible: now >= transitionEligibleDate,
            daysRemaining: Math.max(0, Math.ceil((transitionEligibleDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
          },
        },
        progress: Math.min(100, Math.round((tenureMonths / minTenure) * 100)),
      };
    }),

  // Create career track for employee
  createCareerTrack: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      trackType: z.enum(["architect_manager", "coordinator_to_manager", "permanent_staff"]),
      isFoundingMember: z.boolean().optional(),
      startDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      
      const startDate = input.startDate ? new Date(input.startDate) : new Date();
      const trackInfo = CAREER_TRACKS[input.trackType];
      const isFounder = input.isFoundingMember || trackInfo.isFounder;

      await (db as any).execute(
        `INSERT INTO career_tracks 
        (employeeId, trackType, currentPhase, startDate, isFoundingMember, boardEligible, mentorEligible)
        VALUES (?, ?, 'onboarding', ?, ?, ?, ?)`,
        [
          input.employeeId,
          input.trackType,
          startDate.toISOString().split('T')[0],
          isFounder,
          trackInfo.boardEligible,
          isFounder,
        ]
      );

      return { success: true };
    }),

  // Update career track phase
  updateCareerTrackPhase: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      newPhase: z.enum(["onboarding", "year_1", "year_2", "transition_eligible", "in_transition", "transitioned", "opted_out"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      
      const updateFields: string[] = ["currentPhase = ?"];
      const updateValues: (string | null)[] = [input.newPhase];
      
      // Set completion dates based on phase
      if (input.newPhase === "year_2") {
        updateFields.push("year1CompletionDate = NOW()");
      } else if (input.newPhase === "transition_eligible") {
        updateFields.push("year2CompletionDate = NOW()");
        updateFields.push("transitionEligibleDate = NOW()");
      } else if (input.newPhase === "in_transition") {
        updateFields.push("transitionStartDate = NOW()");
      } else if (input.newPhase === "transitioned") {
        updateFields.push("transitionCompletedDate = NOW()");
      } else if (input.newPhase === "opted_out") {
        updateFields.push("optedOutDate = NOW()");
        if (input.notes) {
          updateFields.push("optOutReason = ?");
          updateValues.push(input.notes);
        }
      }
      
      if (input.notes && input.newPhase !== "opted_out") {
        updateFields.push("notes = ?");
        updateValues.push(input.notes);
      }
      
      updateValues.push(String(input.employeeId));
      
      await (db as any).execute(
        `UPDATE career_tracks SET ${updateFields.join(", ")} WHERE employeeId = ?`,
        updateValues
      );

      return { success: true };
    }),

  // Get all career tracks with employee info
  getAllCareerTracks: protectedProcedure
    .input(z.object({
      trackType: z.enum(["architect_manager", "coordinator_to_manager", "permanent_staff", "all"]).optional(),
      phase: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await requireDb();
      
      let query = `
        SELECT ct.*, e.firstName, e.lastName, e.email, e.department, e.position, e.hireDate
        FROM career_tracks ct
        LEFT JOIN employees e ON ct.employeeId = e.id
        WHERE 1=1
      `;
      const params: string[] = [];
      
      if (input?.trackType && input.trackType !== "all") {
        query += " AND ct.trackType = ?";
        params.push(input.trackType);
      }
      
      if (input?.phase) {
        query += " AND ct.currentPhase = ?";
        params.push(input.phase);
      }
      
      query += " ORDER BY ct.startDate ASC";
      
      const [tracks] = await (db as any).execute(query, params);
      
      // Calculate tenure for each track
      const tracksWithTenure = (tracks as any[]).map((track) => {
        const startDate = new Date(track.startDate);
        const now = new Date();
        const tenureMonths = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        const trackInfo = CAREER_TRACKS[track.trackType as keyof typeof CAREER_TRACKS];
        const minTenure = trackInfo?.minTenureMonths || 24;
        
        return {
          ...track,
          tenure: {
            months: tenureMonths,
            years: Math.floor(tenureMonths / 12),
          },
          progress: Math.min(100, Math.round((tenureMonths / minTenure) * 100)),
          trackInfo,
        };
      });

      return tracksWithTenure;
    }),

  // Get dashboard stats
  getWorkforceDashboard: protectedProcedure.query(async () => {
    const db = await requireDb();
    
    // Get system settings
    const [settings] = await (db as any).execute("SELECT * FROM system_settings");
    const settingsMap: Record<string, string> = {};
    (settings as SystemSetting[]).forEach((s) => {
      settingsMap[s.settingKey] = s.settingValue;
    });
    
    // Get track counts by phase
    const [phaseCounts] = await (db as any).execute(`
      SELECT currentPhase, COUNT(*) as count
      FROM career_tracks
      GROUP BY currentPhase
    `);
    
    // Get track counts by type
    const [typeCounts] = await (db as any).execute(`
      SELECT trackType, COUNT(*) as count
      FROM career_tracks
      GROUP BY trackType
    `);
    
    // Get founding members count
    const [founderCount] = await (db as any).execute(`
      SELECT COUNT(*) as count FROM career_tracks WHERE isFoundingMember = TRUE
    `);
    
    // Get transition eligible count
    const [eligibleCount] = await (db as any).execute(`
      SELECT COUNT(*) as count FROM career_tracks 
      WHERE currentPhase = 'transition_eligible'
    `);
    
    // Get transitioned count
    const [transitionedCount] = await (db as any).execute(`
      SELECT COUNT(*) as count FROM career_tracks 
      WHERE currentPhase = 'transitioned'
    `);

    return {
      systemPhase: settingsMap.system_phase || "build",
      transitionsEnabled: settingsMap.transition_enabled === "true",
      minTenureManager: parseInt(settingsMap.min_tenure_manager_months || "24"),
      minTenureCoordinator: parseInt(settingsMap.min_tenure_coordinator_months || "24"),
      stats: {
        byPhase: (phaseCounts as any[]).reduce((acc, p) => {
          acc[p.currentPhase] = p.count;
          return acc;
        }, {} as Record<string, number>),
        byType: (typeCounts as any[]).reduce((acc, t) => {
          acc[t.trackType] = t.count;
          return acc;
        }, {} as Record<string, number>),
        foundingMembers: (founderCount as any[])[0]?.count || 0,
        transitionEligible: (eligibleCount as any[])[0]?.count || 0,
        transitioned: (transitionedCount as any[])[0]?.count || 0,
      },
    };
  }),

  // Check if employee can transition
  checkTransitionEligibility: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await requireDb();
      
      // Get system settings
      const [settings] = await (db as any).execute("SELECT * FROM system_settings");
      const settingsMap: Record<string, string> = {};
      (settings as SystemSetting[]).forEach((s) => {
        settingsMap[s.settingKey] = s.settingValue;
      });
      
      const systemPhase = settingsMap.system_phase || "build";
      const transitionsEnabled = settingsMap.transition_enabled === "true";
      
      // Get career track
      const [tracks] = await (db as any).execute(
        "SELECT * FROM career_tracks WHERE employeeId = ?",
        [input.employeeId]
      );
      
      const track = (tracks as CareerTrack[])[0];
      
      if (!track) {
        return {
          eligible: false,
          reasons: ["No career track found for this employee"],
        };
      }
      
      const reasons: string[] = [];
      let eligible = true;
      
      // Check system phase
      if (systemPhase !== "operations") {
        eligible = false;
        reasons.push(`System is in ${systemPhase} phase. Transitions are not enabled.`);
      }
      
      // Check transitions enabled
      if (!transitionsEnabled) {
        eligible = false;
        reasons.push("Transitions are currently disabled system-wide.");
      }
      
      // Check tenure
      const startDate = new Date(track.startDate);
      const now = new Date();
      const tenureMonths = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      const trackInfo = CAREER_TRACKS[track.trackType as keyof typeof CAREER_TRACKS];
      const minTenure = trackInfo?.minTenureMonths || 24;
      
      if (tenureMonths < minTenure) {
        eligible = false;
        reasons.push(`Minimum tenure not met. ${minTenure - tenureMonths} months remaining.`);
      }
      
      // Check current phase
      if (track.currentPhase === "transitioned") {
        eligible = false;
        reasons.push("Employee has already transitioned.");
      }
      
      if (track.currentPhase === "opted_out") {
        eligible = false;
        reasons.push("Employee has opted out of the transition program.");
      }
      
      if (track.currentPhase === "in_transition") {
        eligible = false;
        reasons.push("Employee is currently in transition process.");
      }

      return {
        eligible,
        reasons: eligible ? ["All requirements met. Employee is eligible for transition."] : reasons,
        tenure: {
          current: tenureMonths,
          required: minTenure,
          remaining: Math.max(0, minTenure - tenureMonths),
        },
        systemPhase,
        transitionsEnabled,
      };
    }),
});

export type WorkforceDevelopmentRouter = typeof workforceDevelopmentRouter;
